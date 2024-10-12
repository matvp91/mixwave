FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install turbo@^2 -g

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @mixwave/dashboard --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/config.env .
RUN turbo run build:frontend --filter=@mixwave/dashboard

FROM devforth/spa-to-http as runner
COPY --from=installer ./app/packages/dashboard/dist .