import { parseEnv } from "@mixwave/shared/env";
import { z } from "zod";

export const env = parseEnv({
  PORT: z.coerce.number().default(52002),
  HOST: z.string().default("0.0.0.0"),
});
