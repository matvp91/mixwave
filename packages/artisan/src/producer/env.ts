import { parseEnv } from "@mixwave/shared";

export const env = parseEnv((t) => ({
  // config.env
  REDIS_HOST: t.String(),
  REDIS_PORT: t.Number(),
}));

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
