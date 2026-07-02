SHELL:=/bin/bash
ARGS = $(filter-out $@,$(MAKECMDGOALS))
MAKEFLAGS += --silent
BASE_PATH=${PWD}
DOCKER_COMPOSE_FILE=$(shell echo -f docker-compose.yml -f docker-compose.override.yml)
TRIVY_IMAGE ?= aquasec/trivy:0.71.0
PROJECT_NAME ?= tanstack-start-template

-include .env
export $(shell sed 's/=.*//' .env 2>/dev/null)

show_env:
	# Show wich DOCKER_COMPOSE_FILE and ENV the recipes will user
	# It should be referenced by all other recipes you want it to show.
	# It's only printed once even when more than a recipe executed uses it
	sh -c "if [ \"${ENV_PRINTED:-0}\" != \"1\" ]; \
	then \
		echo DOCKER_COMPOSE_FILE = \"${DOCKER_COMPOSE_FILE}\"; \
		echo OSFLAG = \"${OSFLAG}\"; \
	fi; \
	ENV_PRINTED=1;"

# ---------------------------------------------------------------------------
# Orquestração docker-compose (ambiente de desenvolvimento)
# ---------------------------------------------------------------------------
build: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} build

_rebuild: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} down
	docker-compose ${DOCKER_COMPOSE_FILE} build --no-cache --force-rm

up: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} up -d --remove-orphans

down: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} down

log: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} logs -f --tail 200 app

logs: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} logs -f --tail 200

stop: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} stop

status: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} ps

restart: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} restart

sh: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} exec ${ARGS} bash

run: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} run ${ARGS}

# ---------------------------------------------------------------------------
# Scripts Node/Vite (executados dentro do container app)
# ---------------------------------------------------------------------------
npm_install: show_env
	docker-compose ${DOCKER_COMPOSE_FILE} exec app npm install ${ARGS}

# ---------------------------------------------------------------------------
# Trivy - Security Scanner
# ---------------------------------------------------------------------------
security-scan:
	@echo "Executando varredura de vulnerabilidades na pasta do projeto (Trivy Docker)..."
	docker run --rm -v $(PWD):/project -v trivy-cache:/root/.cache/trivy $(TRIVY_IMAGE) fs \
		--scanners vuln,misconfig,secret \
		--exit-code 0 \
		--severity HIGH,CRITICAL,MEDIUM \
		--include-dev-deps \
		--ignorefile /project/.trivyignore \
		/project

security-scan-image:
	@echo "Building and scanning production Docker image..."
	docker build --no-cache -t $(PROJECT_NAME):trivy-scan -f app/Dockerfile app
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD):/project \
		-v trivy-cache:/root/.cache/trivy \
		$(TRIVY_IMAGE) image \
		--scanners vuln,misconfig,secret \
		--exit-code 0 \
		--severity HIGH,CRITICAL,MEDIUM \
		--ignorefile /project/.trivyignore \
		$(PROJECT_NAME):trivy-scan
