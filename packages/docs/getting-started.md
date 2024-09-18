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

Create a `config.env` file at the <Badge type="info" text="root" /> of the project.

::: code-group

```sh [config.env]
S3_ENDPOINT=
S3_REGION=us-east-1
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=mixwave
S3_PUBLIC_URL=https://s3.us-east-1.amazonaws.com/mixwave
```

:::

Bootstrap the necessary services with [Docker Compose](https://docs.docker.com/compose/).

::: code-group

```sh [shell]
$ docker compose up -d --build
```

:::

Next, go to `http://127.0.0.1:52000` in your browser and you'll be greeted with the dashboard.

::: info
In a scalable architecture, you probably do not want to run the ffmpeg and transcode workers on the same machine as your api or the stitcher. The Docker setup is meant to get you started quickly, locally.
:::

## Manual

### Prerequisites

- A [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/) server, with [JSON](https://redis.io/docs/latest/develop/data-types/json/) support. We suggest [Redis Stack](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/).
- Node v20.16.0 or above.
- The [pnpm](https://pnpm.io/installation) package manager.

### Build

Mixwave is a monorepo, running `pnpm run build` at the root of the project will create a `dist` folder with the node files needed to start the api, stitcher and workers.

### Services

Once built, you can run each package separately by going to the package directory and running `pnpm run start`. When you run redis locally, add the following variables to the `config.env` file at your root:

::: code-group

```sh [config.env]
REDIS_HOST=localhost
REDIS_PORT=6379
```

:::

There's two packages that provide you with an API:

- `api`: The main api endpoint where you can start a transcode or package job.
- `stitcher`: A manifest manipulator proxy where you can customize the HLS playlist on the fly.

Then there's `artisan`, the actual job runner.

::: info
Jobs get pushed onto a queue and are consumed by artisan. You can run multiple artisan instances across different machines in order to scale the ffmpeg or package work.
:::

Finally, we have a React app named `dashboard` which uses the api package to display a list of running, completed or failed jobs. This is a single page application and can be hosted statically, it does not require node.
