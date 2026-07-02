FROM node:22-alpine@sha256:9385cd9f3001dfc3431e8ead12c43e9e1f87cc1b9b5c6cfd0f73865d405b27c4 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG GIT_SHA=
ARG BUILD_DATE=
ENV GIT_SHA=${GIT_SHA}
ENV BUILD_DATE=${BUILD_DATE}

ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY . .
RUN npm run build

FROM node:22-alpine@sha256:9385cd9f3001dfc3431e8ead12c43e9e1f87cc1b9b5c6cfd0f73865d405b27c4 AS serve

WORKDIR /app

RUN apk update && apk upgrade libcrypto3 libssl3 && rm -rf /var/cache/apk/*

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

ENV NODE_ENV=production
ENV PORT=80

COPY --from=build /app/.output /app/.output
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

EXPOSE 80

USER nodeuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:80/').then(r => { process.exit(r.ok ? 0 : 1) }).catch(() => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
