import { z } from "zod";

const envSchema = z.object({
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
});

const env = envSchema.parse(process.env);

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
