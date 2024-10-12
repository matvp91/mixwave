---
next:
  text: "Features: Transcode"
  link: "/features/transcode"
---

# Getting Started

## Docker Compose

Since Mixwave consists of several packages that need to work together, the easiest way to get yourself familiar is to use [Docker](https://docs.docker.com/engine/install/).

First, clone the repository.

::: code-group

```sh [shell]
$ git clone git@github.com:matvp91/mixwave.git
$ cd mixwave
```

:::

Create a `config.env` file at the root of the project. Make sure you use the same keys defined in `config.env.example`.

::: code-group

```sh [config.env]
S3_ENDPOINT=
S3_REGION=us-east-1
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=mixwave
REDIS_HOST=redis
REDIS_PORT=6379
PUBLIC_API_ENDPOINT=http://localhost:52001
PUBLIC_STITCHER_ENDPOINT=http://localhost:52002
PUBLIC_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com/mixwave
```

:::

Build and start the necessary services with [Docker Compose](https://docs.docker.com/compose/).

::: code-group

```sh [shell]
$ docker compose up -d --build
```

:::

We host the dashboard on port `52000` by default. Open `http://127.0.0.1:52000` in your browser and you're good to go.

::: info
In a scalable architecture, you probably do not want to run the ffmpeg and transcode workers on the same machine as your api or the stitcher. The Docker setup is meant to get you started quickly, locally.
:::

## Local build

### Prerequisites

- A [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/) server, with [JSON](https://redis.io/docs/latest/develop/data-types/json/) support. We suggest [Redis Stack](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/).
- Bun v1.1.30 or above.
- The [pnpm](https://pnpm.io/installation) package manager.

### Build

Mixwave is a monorepo, running `pnpm run build` at the root of the project will create a `dist` folder with the node files needed to start the api, stitcher and workers.

Mixwave is a monorepo, we rely on Bun as a runtime. There's a couple of packages (such as client apps) that require a build step, you can do that by running `pnpm build` in the root. This'll build the player, dashboard and docs.

### Development

::: info
Make sure you have a config.env file at the root, and it contains the right info.
:::

We aim to make it as easy for you to get started with development. All you'll have to do is install the dependencies (once), and call the dev script.

```sh
pnpm install
pnpm dev
```

If you did not specify other ports for the separate services, you'd have these services running now:

- Dashboard: localhost:52000
- API: localhost:52001
- Stitcher: localhost:52002

The artisan workers have also been booted in the background, and they're ready to do some transcoding work.
