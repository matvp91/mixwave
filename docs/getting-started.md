---
next:
  text: "Features: Transcode"
  link: "/features/transcode"
---

# Getting Started

## Docker Compose

If you're familiar with [Docker](https://docs.docker.com/engine/install/), we suggest you use our hosted Docker images.

Create a new folder with a fresh `docker-compose.yml` file and copy it from below. The original file can be found on [GitHub](https://github.com/matvp91/mixwave/tree/main/docker/docker-compose.yml).

```yaml
version: "3"

volumes:
  mixwave_redis_data:

services:
  mixwave-dashboard:
    image: "mixwave/dashboard:latest"
    ports:
      - 52000:52000
    env_file: config.env

  mixwave-api:
    image: "mixwave/api:latest"
    restart: always
    ports:
      - 52001:52001
    depends_on:
      - mixwave-redis
    env_file: config.env
    environment:
      - REDIS_HOST=mixwave-redis
      - REDIS_PORT=6379

  mixwave-stitcher:
    image: "mixwave/stitcher:latest"
    restart: always
    ports:
      - 52002:52002
    depends_on:
      - mixwave-redis
    env_file: config.env
    environment:
      - REDIS_HOST=mixwave-redis
      - REDIS_PORT=6379

  mixwave-artisan:
    image: "mixwave/artisan:latest"
    restart: always
    depends_on:
      - mixwave-redis
    env_file: config.env
    environment:
      - REDIS_HOST=mixwave-redis
      - REDIS_PORT=6379

  mixwave-redis:
    image: redis/redis-stack-server:7.2.0-v6
    ports:
      - 6379:6379
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
    volumes:
      - mixwave_redis_data:/data
```

Create a `config.env` file in the same folder. The original example can be found on [GitHub](https://github.com/matvp91/mixwave/blob/main/config.env.example).

::: code-group

```sh [config.env]
S3_ENDPOINT=
S3_REGION=us-east-1
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=mixwave
PUBLIC_API_ENDPOINT=http://localhost:52001
PUBLIC_STITCHER_ENDPOINT=http://localhost:52002
PUBLIC_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com/mixwave
```

:::

Start the necessary services with [Docker Compose](https://docs.docker.com/compose/).

::: code-group

```sh [shell]
$ docker compose up -d
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
pnpm install-bin # helper to install ffmpeg, packager
pnpm install
pnpm dev
```

If you did not specify other ports for the separate services, you'd have these services running now:

- Dashboard - localhost:52000
- API - localhost:52001
- Stitcher - localhost:52002

The artisan workers have also been booted in the background, and they're ready to do some transcoding work.
