import { getFakeJob } from "../../lib/job-helpers.js";
import { uploadJsonFile } from "../s3.js";
import type { Input, Stream } from "../../schemas.js";
import type { FfmpegResult } from "./ffmpeg.js";
import type { Job } from "bullmq";

export type TranscodeData = {
  assetId: string;
  inputs: Input[];
  streams: Stream[];
  segmentSize: number;
};

export type TranscodeResult = {
  assetId: string;
};

export default async function (job: Job<TranscodeData, TranscodeResult>) {
  const fakeJob = await getFakeJob<TranscodeData>(job);

  const childrenValues = await fakeJob.getChildrenValues();

  const meta = Object.entries(childrenValues).reduce<Record<string, Stream>>(
    (acc, [key, value]) => {
      if (key.startsWith("bull:ffmpeg")) {
        const ffmpegResult: FfmpegResult = value;
        acc[ffmpegResult.name] = ffmpegResult.stream;
      }
      return acc;
    },
    {}
  );

  await job.log(`Writing meta.json (${JSON.stringify(meta)})`);

  await uploadJsonFile(
    `transcode/${job.data.assetId}/meta.json`,
    JSON.stringify(meta, null, 2)
  );

  job.updateProgress(100);

  return {
    assetId: job.data.assetId,
  };
}
