import { parseEnv } from "shared";

export const env = parseEnv((t) => ({
  // process
  PORT: t.Number({ default: 52002 }),
  HOST: t.String({ default: "0.0.0.0" }),

  // config.env
  REDIS_HOST: t.String(),
  REDIS_PORT: t.Number(),
  PUBLIC_S3_ENDPOINT: t.String(),
  PUBLIC_STITCHER_ENDPOINT: t.String(),
}));
