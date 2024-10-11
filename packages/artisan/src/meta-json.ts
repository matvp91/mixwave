import { Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { readFile } from "fs/promises";
import { VideoCodecEnum, AudioCodecEnum, LangCodeEnum } from "@mixwave/shared";

const metaJsonSchema = t.Object({
  version: t.Number(),
  streams: t.Record(
    t.String(),
    t.Union([
      t.Object({
        type: t.Literal("video"),
        codec: VideoCodecEnum,
        height: t.Number(),
        bitrate: t.Number(),
        framerate: t.Number(),
      }),
      t.Object({
        type: t.Literal("audio"),
        codec: AudioCodecEnum,
        bitrate: t.Number(),
        language: LangCodeEnum,
      }),
      t.Object({
        type: t.Literal("text"),
        language: LangCodeEnum,
      }),
    ]),
  ),
  segmentSize: t.Number(),
});

export async function getMetaJson(dirName: string) {
  return Value.Parse(
    metaJsonSchema,
    JSON.parse(await readFile(`${dirName}/meta.json`, "utf8")),
  );
}
