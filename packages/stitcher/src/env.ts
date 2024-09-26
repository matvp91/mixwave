import { z } from "zod";
import findConfig from "find-config";
import { config } from "dotenv";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

const envSchema = z.object({
  PORT: z.coerce.number().default(52002),
  HOST: z.string().default("0.0.0.0"),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  PUBLIC_S3_ENDPOINT: z.string(),
  PUBLIC_STITCHER_ENDPOINT: z.string(),
});

export const env = envSchema.parse(process.env);
