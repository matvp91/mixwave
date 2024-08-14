---
next: false
---

# Getting Started

Cloning the GitHub repository is the easiest way to get started with self-hosted Mixwave. This guide assumes you are running the command from the machine you intend to host from.

```shell
git clone git@github.com:matvp91/mixwave.git
```

::: info
This guide will help you install Mixwave locally. If you want production or "ready to cloud" guides, see [Installation](installation).
:::

## Prerequisites

- A [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/) server. For demo purpose, we'll run it on `localhost:6379`.
- Node v20.16.0 or above.
- The [pnpm](https://pnpm.io/installation) package manager.

## Install dependencies

```shell
cd mixwave

# Mixwave is a monorepo,
# it'll install all required dependencies of all packages.
pnpm install
```

## Environment variables

Each package has its own `.env` file. We'll start by configuring the `dashboard` package with the correct variables, it'll run in a `development` environment on port <Badge type="info" text="3000" />.

```shell
cd packages/dashboard
cp .env.example .env
```

```shell
# The URL to the API, for demo purposes, we'll run everything locally.
VITE_API_URL=http://localhost:3001
```

Next up, let's configure the `api` package.

```shell
cd packages/api
cp .env.example .env
```

```shell
PORT=3001
# Our local redis, but any redis-like service should do.
REDIS_HOST=localhost
REDIS_PORT=6379
# The URL to the stitcher
STITCHER_URL=http://localhost:3002
```

::: tip
[fly.io](https://fly.io/) provides [Upstash (Redis)](https://community.fly.io/t/upstash-for-redis-new-10-mo-single-region-fixed-price-plan) plans at a reasonable price, perfect for smaller projects. We also support [AWS Elasticache](https://aws.amazon.com/elasticache/) as your Redis instance too.
:::

Now we're going to configure `artisan`, this package is responsible for running the workers responsible for transcoding, packaging, ...

```shell
cd packages/artisan
cp .env.example .env
```

```shell
# The following S3 variables are simply passed to the S3 JS SDK:
# See https://github.com/matvp91/mixwave/blob/main/packages/artisan/src/consumer/s3.ts
S3_ENDPOINT=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=mixwave
REDIS_HOST=localhost
REDIS_PORT=6379
```

::: tip
The artisan package is not a web server, and does not have a public API. It is code that polls the redis instance for pending jobs and processes them one by one. You can run as many artisan instances on as many machines as you like for parallel, batch processing.
:::

## Run locally

Now that we have configured the `.env` variables for the different packages, we can start the services locally. We have a `start` helper in the monorepo root, simply call it to boot the different services.

```shell
# Build all packages.
pnpm run build

# A helper to start node services.
# This'll run api, artisan and stitcher on your configured ports.
pnpm run start
```

There's an [OpenAPI](https://swagger.io/specification/) spec available at `http://localhost:3001/spec.json`. We'll show you how to run the `dashboard` front-end next, which uses this spec to show API documentation.

## Dashboard

The dashboard is a client application that visualizes running jobs, its statuses and has auto-generated API documentation based on the `spec.json` API endpoint. The API documentation is built with [Scalar](https://github.com/scalar/scalar).

```shell
# In a different terminal
npx serve packages/dashboard/dist
```

Typically, you'd want to build the dashboard once and upload it to `S3` to serve it as a static site. The dashboard is an SPA and requires no separate server / backend to function.

You can use the API docs to `Test Request`.

<img src="./assets/dashboard-api.png" alt="Dashboard API" class="image-rounded" />

Each job, or child job, has detailed logs.

<img src="./assets/dashboard-job.png" alt="Dashboard job" class="image-rounded" />
