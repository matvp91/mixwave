FROM oven/bun:1

RUN apt-get update && apt-get install -y \
  curl

WORKDIR /usr/src/app
COPY ./dist .
COPY ./scripts .

RUN "./install-bin.sh"

USER bun
CMD [ "bun", "run", "./index.js" ]