# Multi-stage build for TanStack Start SSR
# Pinned by digest for supply-chain integrity (tag: node:22-alpine)
FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS build

WORKDIR /app

COPY package.json package-lock.json ./
# scripts/ must be present before `npm ci` because the postinstall hook runs
# scripts/apply-router-plugin-patch.cjs (the router-plugin HMR patch).
COPY scripts/ scripts/
RUN npm ci

# Build version metadata, provided by the GitHub Actions workflow / build-and-push.sh
# build-args (the build context has no .git, so the version comes from these instead).
ARG GIT_SHA=
ARG BUILD_DATE=
ENV GIT_SHA=${GIT_SHA}
ENV BUILD_DATE=${BUILD_DATE}

# VITE_API_DOMAIN is a CLIENT-side (Vite) var: it is inlined into the JS bundle
# at `npm run build` time, NOT read at container runtime. It is the browser-facing
# backend host (host only, e.g. "api.example.com") used by src/lib/api-client.ts.
# It MUST be passed here as a build-arg — setting it only in the runtime env has
# no effect (the bundle is already built). Empty default falls back to localhost:8080.
ARG VITE_API_DOMAIN=
ENV VITE_API_DOMAIN=${VITE_API_DOMAIN}

COPY . .
RUN npm run build

# Server runtime — Node.js for SSR
FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS serve

WORKDIR /app

RUN apk update && apk upgrade libcrypto3 libssl3 && rm -rf /var/cache/apk/*

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

ENV NODE_ENV=production
ENV PORT=80
# API_BASE_URL must be passed via 'docker run -e API_BASE_URL=https://your-api.com'
# or set in the container runtime environment. No default is provided here
# to avoid leaking production URLs into the image.

COPY --from=build /app/.output /app/.output
COPY --from=build /app/package.json /app/package-lock.json ./
# Same postinstall hook runs here; provide scripts/ so `npm ci` doesn't fail.
# The patch self-skips when @tanstack/router-plugin (a devDep) is absent.
COPY --from=build /app/scripts ./scripts
RUN npm ci --omit=dev && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

EXPOSE 80

USER nodeuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:80/').then(r => { process.exit(r.ok ? 0 : 1) }).catch(() => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
