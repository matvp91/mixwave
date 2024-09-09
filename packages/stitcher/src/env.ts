import { z } from "zod";
import findConfig from "find-config";
import { config } from "dotenv";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

const envSchema = z.object({
  STITCHER_BASE_URL: z.string().optional(),
  PORT: z.coerce.number().default(52002),
  HOST: z.string().default("0.0.0.0"),
  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.coerce.number().default(6379),
  S3_PUBLIC_URL: z.string(),
});

export const env = envSchema.parse(process.env);
