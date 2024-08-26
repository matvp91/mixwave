import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  HOST: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
});

export const env = envSchema.parse(process.env);
