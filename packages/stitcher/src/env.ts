import { parse } from "@zodyac/env";
import { z } from "zod";

export const env = parse(
  z.object({
    PORT: z.coerce.number(),
    S3_PUBLIC_URL: z.string(),
  }),
);
