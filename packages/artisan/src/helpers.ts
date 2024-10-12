import { Job, Queue } from "bullmq";
import { Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import * as fs from "node:fs/promises";
import { VideoCodecEnum, AudioCodecEnum, LangCodeEnum } from "@mixwave/shared";
import { connection } from "./connection";

export async function getFakeJob<T>(job: Job) {
  if (!job.id) {
    throw new Error("Missing job id");
  }

  const queue = new Queue(job.queueName, { connection });
  const fakeJob = await Job.fromId<T>(queue, job.id);

  if (!fakeJob) {
    throw new Error("Failed to fetch fake job");
  }

  return fakeJob;
}

export async function getMetaJson(dirName: string) {
  const text = await fs.readFile(`${dirName}/meta.json`, "utf8");
  return Value.Parse(metaJsonSchema, JSON.parse(text));
}

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
