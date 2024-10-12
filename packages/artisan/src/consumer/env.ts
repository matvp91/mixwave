import { parseEnv } from "@mixwave/shared";

export const env = parseEnv((t) => ({
  // config.env
  S3_ENDPOINT: t.String(),
  S3_REGION: t.String(),
  S3_ACCESS_KEY: t.String(),
  S3_SECRET_KEY: t.String(),
  S3_BUCKET: t.String(),
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
