import { z } from "zod";
import findConfig from "find-config";
import { config } from "dotenv";
import type { ZodRawShape } from "zod";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

export function parseEnv<T extends ZodRawShape>(shape: T) {
  return z.object(shape).parse(process.env);
}
