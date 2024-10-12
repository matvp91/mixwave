import { parseEnv } from "@mixwave/shared";

export const env = parseEnv((t) => ({
  // process
  PORT: t.Number({ default: 52001 }),
  HOST: t.String({ default: "0.0.0.0" }),

  // config.env
  REDIS_HOST: t.String(),
  REDIS_PORT: t.Number(),
  S3_ENDPOINT: t.String(),
  S3_REGION: t.String(),
  S3_ACCESS_KEY: t.String(),
  S3_SECRET_KEY: t.String(),
  S3_BUCKET: t.String(),
  PUBLIC_API_ENDPOINT: t.String(),
}));
