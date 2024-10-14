FROM oven/bun:1

WORKDIR /usr/src/app
COPY ./dist .

USER bun
EXPOSE 52001/tcp
CMD [ "bun", "run", "./index.js" ]