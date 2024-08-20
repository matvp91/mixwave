import { parse } from "@zodyac/env";
import { z } from "zod";

export const env = parse(
  z.object({
    PORT: z.coerce.number(),
    HOST: z.string(),
    S3_PUBLIC_URL: z.string(),
  }),
);
