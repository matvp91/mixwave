import { Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { readFile } from "fs/promises";
import type { Stream } from "@mixwave/artisan-producer";

const metaJsonSchema = t.Object({
  version: t.Number(),
  streams: t.Record(t.String(), t.Unsafe<Stream>()),
  segmentSize: t.Number(),
});

export async function getMetaJson(dirName: string) {
  return Value.Parse(
    metaJsonSchema,
    JSON.parse(await readFile(`${dirName}/meta.json`, "utf8")),
  );
}
