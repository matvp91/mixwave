import { z } from "zod";
import findConfig from "find-config";
import { config } from "dotenv";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

const envSchema = z.object({
  PORT: z.coerce.number().default(52001),
  HOST: z.string().default("0.0.0.0"),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  PUBLIC_API_ENDPOINT: z.string(),
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
});

export const env = envSchema.parse(process.env);
