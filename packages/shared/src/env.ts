import { z } from "zod";
import findConfig from "find-config";
import { config } from "dotenv";
import type { ZodRawShape } from "zod";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

const envSchema = z.object({
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  PUBLIC_API_ENDPOINT: z.string(),
  PUBLIC_S3_ENDPOINT: z.string(),
  PUBLIC_STITCHER_ENDPOINT: z.string(),
});

export function parseEnv<T extends ZodRawShape>(shape: T) {
  return envSchema.merge(z.object(shape)).parse(process.env);
}
