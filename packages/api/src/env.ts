import { parse } from "@zodyac/env";
import { z } from "zod";

export const env = parse(
  z.object({
    PORT: z.coerce.number(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    STITCHER_URL: z.string(),
  })
);
