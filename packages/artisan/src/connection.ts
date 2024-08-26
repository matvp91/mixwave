let port = 6379;
if (process.env.REDIS_PORT) {
  port = +process.env.REDIS_PORT;
}

export const connection = {
  host: process.env.REDIS_HOST ?? "redis",
  port,
};
