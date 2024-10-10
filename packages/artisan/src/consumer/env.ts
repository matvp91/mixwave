import { parseEnv } from "@mixwave/shared/env";
import { z } from "zod";

export const env = parseEnv({
  // config.env
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
});
