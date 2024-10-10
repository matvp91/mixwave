import { z } from "zod";
import { parseEnv } from "@mixwave/shared/env";

export const env = parseEnv({
  PORT: z.coerce.number().default(52001),
  HOST: z.string().default("0.0.0.0"),
});
