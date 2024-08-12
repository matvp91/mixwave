import { parse } from "@zodyac/env";
import { z } from "zod";

export const env = parse(
  z.object({
    BASE_URL: z.string(),
  }),
);
