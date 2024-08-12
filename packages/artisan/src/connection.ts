import { parse } from "@zodyac/env";
import { z } from "zod";

const env = parse(
  z.object({
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
  })
);

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
