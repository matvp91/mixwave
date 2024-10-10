import { getFakeJob } from "../job-helpers.js";
import { uploadJsonFile } from "../s3.js";
import { addPackageJob } from "../../producer.js";
import type { Stream } from "@mixwave/shared/artisan";
import type { FfmpegResult } from "./ffmpeg.js";
import type { Job } from "bullmq";

export type TranscodeData = {
  params: {
    assetId: string;
    segmentSize: number;
    packageAfter: boolean;
  };
  metadata: {
    tag?: string;
  };
};

export type TranscodeResult = {
  assetId: string;
};

export default async function (job: Job<TranscodeData, TranscodeResult>) {
  const { params, metadata } = job.data;

  const fakeJob = await getFakeJob<TranscodeData>(job);

  const childrenValues = await fakeJob.getChildrenValues();

  const meta = {
    version: 1,
    streams: Object.entries(childrenValues).reduce<Record<string, Stream>>(
      (acc, [key, value]) => {
        if (key.startsWith("bull:ffmpeg")) {
          const ffmpegResult: FfmpegResult = value;
          acc[ffmpegResult.name] = ffmpegResult.stream;
        }
        return acc;
      },
      {},
    ),
    segmentSize: params.segmentSize,
  };

  await job.log(`Writing meta.json (${JSON.stringify(meta)})`);

  await uploadJsonFile(
    `transcode/${params.assetId}/meta.json`,
    JSON.stringify(meta, null, 2),
  );

  if (params.packageAfter) {
    await job.log("Will queue package job");
    await addPackageJob({
      assetId: params.assetId,
      segmentSize: params.segmentSize,
      tag: metadata.tag,
    });
  }

  job.updateProgress(100);

  return {
    assetId: params.assetId,
  };
}
