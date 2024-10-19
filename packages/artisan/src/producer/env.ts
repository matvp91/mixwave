import { parseEnv } from "shared";

export const env = parseEnv((t) => ({
  // config.env
  REDIS_HOST: t.String(),
  REDIS_PORT: t.Number(),
}));

/**
 * Redis connection.
 */
export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
