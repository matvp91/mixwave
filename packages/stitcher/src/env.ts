import { parseEnv } from "@mixwave/shared/env";
import { z } from "zod";

export const env = parseEnv({
  // process
  PORT: z.coerce.number().default(52002),
  HOST: z.string().default("0.0.0.0"),

  // config.env
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  PUBLIC_S3_ENDPOINT: z.string(),
  PUBLIC_STITCHER_ENDPOINT: z.string(),
});
