FROM oven/bun:1

WORKDIR /usr/src/app
COPY ./dist .

USER bun
CMD [ "bun", "run", "./index.js" ]