import { getFakeJob } from "../../lib/job-helpers.js";
import { uploadJsonFile } from "../s3.js";
import { addPackageJob } from "../../producer.js";
import type { Stream } from "../../schemas.js";
import type { FfmpegResult } from "./ffmpeg.js";
import type { Job } from "bullmq";

export type TranscodeData = {
  assetId: string;
  package: boolean;
  tag: string;
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
    {},
  );

  await job.log(`Writing meta.json (${JSON.stringify(meta)})`);

  await uploadJsonFile(
    `transcode/${job.data.assetId}/meta.json`,
    JSON.stringify(meta, null, 2),
  );

  if (job.data.package) {
    await job.log("Will queue package job");
    await addPackageJob({
      assetId: job.data.assetId,
      tag: job.data.tag,
    });
  }

  job.updateProgress(100);

  return {
    assetId: job.data.assetId,
  };
}
