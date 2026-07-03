#!/usr/bin/env bash
set -euo pipefail

# Build + push local da imagem para o GHCR.
#
# A tag é derivada de `origin/main` (não do HEAD local), para casar com um
# deploy.sh de servidor que faz pull de
# ghcr.io/<owner>/<image>:<sha7-de-origin/main>.
#
# Autenticação no registry é feita via `gh auth token`.
#
# Configure via env vars:
#   REPO_OWNER  (default: o dono do repo no GHCR)
#   IMAGE_NAME  (default: ${REPO_OWNER}/tanstack-start-template)

REGISTRY="ghcr.io"
REPO_OWNER="${REPO_OWNER:-your-org}"
IMAGE_NAME="${IMAGE_NAME:-${REPO_OWNER}/tanstack-start-template}"
IMAGE_REF="${REGISTRY}/${IMAGE_NAME}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Erro: gh CLI não encontrado no PATH." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Erro: docker não encontrado no PATH." >&2
  exit 1
fi

echo "==> Atualizando refs de ${REMOTE}"
git fetch "${REMOTE}" "${BRANCH}" --quiet

REMOTE_SHA="$(git rev-parse "${REMOTE}/${BRANCH}")"
LOCAL_SHA="$(git rev-parse HEAD)"
SHORT_SHA="$(git rev-parse --short=7 "${REMOTE_SHA}")"

if [[ "${LOCAL_SHA}" != "${REMOTE_SHA}" ]]; then
  echo "Aviso: HEAD local (${LOCAL_SHA:0:7}) difere de ${REMOTE}/${BRANCH} (${SHORT_SHA})." >&2
  echo "       O deploy.sh do servidor vai puxar a tag :${SHORT_SHA}, então o build" >&2
  echo "       precisa ser feito a partir desse commit. Faça push das mudanças e tente de novo," >&2
  echo "       ou rode com ALLOW_DIVERGENCE=1 (não recomendado)." >&2
  if [[ "${ALLOW_DIVERGENCE:-0}" != "1" ]]; then
    exit 1
  fi
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Aviso: working tree sujo — mudanças não commitadas vão entrar na imagem." >&2
  if [[ "${ALLOW_DIRTY:-0}" != "1" ]]; then
    echo "       Commit/stash as mudanças, ou rode com ALLOW_DIRTY=1." >&2
    exit 1
  fi
fi

BUILD_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
GH_USER="$(gh api user --jq .login)"
GH_TOKEN="$(gh auth token)"

echo "==> Autenticando no ${REGISTRY} como ${GH_USER}"
echo "${GH_TOKEN}" | docker login "${REGISTRY}" -u "${GH_USER}" --password-stdin

echo "==> Build: ${IMAGE_REF}:${SHORT_SHA} e :latest"
# Usa `docker build` direto (sem buildx) pra evitar o builder em container,
# que tipicamente tem limite de memória menor e causa OOM no `npm ci` quando
# o build precisa de emulação amd64 num host ARM.
docker build \
  --platform linux/amd64 \
  --file ./app/Dockerfile \
  --tag "${IMAGE_REF}:${SHORT_SHA}" \
  --tag "${IMAGE_REF}:latest" \
  --build-arg "GIT_SHA=${REMOTE_SHA}" \
  --build-arg "BUILD_DATE=${BUILD_DATE}" \
  --build-arg "VITE_API_DOMAIN=${VITE_API_DOMAIN:-api.example.com}" \
  ./app

echo "==> Push: ${IMAGE_REF}:${SHORT_SHA}"
docker push "${IMAGE_REF}:${SHORT_SHA}"

echo "==> Push: ${IMAGE_REF}:latest"
docker push "${IMAGE_REF}:latest"

echo "==> OK"
echo "    ${IMAGE_REF}:${SHORT_SHA}"
echo "    ${IMAGE_REF}:latest"
echo
echo "Pronto pra rodar deploy.sh no servidor — ele vai puxar a tag :${SHORT_SHA}."
