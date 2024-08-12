import { parse } from "@zodyac/env";
import { z } from "zod";

export const env = parse(
  z.object({
    S3_ENDPOINT: z.string(),
    S3_REGION: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_BUCKET: z.string(),
  })
);
