FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install turbo@^2 -g

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @mixwave/artisan --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
COPY --from=builder /app/out/full/ .

FROM oven/bun:1 as runner
WORKDIR /app
COPY --from=installer ./app .
CMD [ "bun", "run", "./packages/artisan/src/index.ts" ]