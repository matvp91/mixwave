import { Type as t, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import * as fs from "node:fs/promises";
import {
  VideoCodecSchema,
  AudioCodecSchema,
  LangCodeSchema,
} from "@mixwave/shared";

/**
 * Versioned schema of the meta file.
 */
const metaSchema = t.Object({
  version: t.Number(),
  streams: t.Record(
    t.String(),
    t.Union([
      t.Object({
        type: t.Literal("video"),
        codec: VideoCodecSchema,
        height: t.Number(),
        bitrate: t.Number(),
        framerate: t.Number(),
      }),
      t.Object({
        type: t.Literal("audio"),
        codec: AudioCodecSchema,
        bitrate: t.Number(),
        language: LangCodeSchema,
      }),
      t.Object({
        type: t.Literal("text"),
        language: LangCodeSchema,
      }),
    ]),
  ),
  segmentSize: t.Number(),
});

export type MetaFile = Static<typeof metaSchema>;

/**
 * Will fetch meta file when meta.json is found in path.
 * @param path S3 dir
 * @returns
 */
export async function getMetaFile(path: string) {
  const text = await fs.readFile(`${path}/meta.json`, "utf8");
  return Value.Parse(metaSchema, JSON.parse(text));
}
