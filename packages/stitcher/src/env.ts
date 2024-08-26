import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  HOST: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  S3_PUBLIC_URL: z.string(),
});

export const env = envSchema.parse(process.env);
