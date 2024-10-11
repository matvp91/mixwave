import { Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import findConfig from "find-config";
import { config } from "dotenv";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

type ParseEnvResolve<R extends Parameters<typeof t.Object>[0]> = (
  typeBox: typeof t,
) => R;

export function parseEnv<R extends Parameters<typeof t.Object>[0]>(
  resolve: ParseEnvResolve<R>,
) {
  const schema = t.Object(resolve(t));
  return Value.Parse(schema, process.env);
}
