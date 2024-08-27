import { z } from "zod";
import findConfig from "find-config";
import { config } from "dotenv";

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
  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.coerce.number().default(6379),
});

export const env = envSchema.parse(process.env);
