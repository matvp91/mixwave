import { addPackageJob } from "@mixwave/artisan-producer";
import { getFakeJob } from "../helpers";
import { uploadJsonFile } from "../s3";
import type {
  Stream,
  FfmpegResult,
  TranscodeData,
  TranscodeResult,
} from "@mixwave/artisan-producer";
import type { Job } from "bullmq";

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
