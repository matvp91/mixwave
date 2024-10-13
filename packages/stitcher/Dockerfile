FROM oven/bun:1

WORKDIR /usr/src/app
COPY ./dist .

USER bun
EXPOSE 52002/tcp
CMD [ "bun", "run", "./index.js" ]