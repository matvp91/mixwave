import { addPackageJob } from "../../producer";
import { getFakeJob } from "../helpers";
import { uploadJson } from "../s3";
import { JOB_SKIPPED } from "./helpers";
import type { FfmpegResult } from "./ffmpeg";
import type { Stream } from "../../types";
import type { Meta } from "../meta";
import type { Job } from "bullmq";
import type { SkippableJobResult } from "./helpers";

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

export type TranscodeResult = SkippableJobResult<{
  assetId: string;
}>;

/**
 * The transcode job relies on the underlying ffmpeg jobs. It waits until these
 * are finished, and handles the meta.json file.
 * @param job
 * @returns
 */
export default async function (
  job: Job<TranscodeData, TranscodeResult>,
): Promise<TranscodeResult> {
  const { params, metadata } = job.data;

  const fakeJob = await getFakeJob<TranscodeData>(job);

  const childrenValues = await fakeJob.getChildrenValues();

  const streams = Object.entries(childrenValues).reduce<Record<string, Stream>>(
    (acc, [key, value]) => {
      if (key.startsWith("bull:ffmpeg")) {
        const result: FfmpegResult = value;
        if (result === JOB_SKIPPED) {
          // We skipped this job, bail out early.
          return acc;
        }
        acc[result.name] = result.stream;
      }
      return acc;
    },
    {},
  );

  if (!Object.keys(streams).length) {
    job.log("Skip transcode, no streams found");
    return JOB_SKIPPED;
  }

  const meta: Meta = {
    version: 1,
    streams,
    segmentSize: params.segmentSize,
  };

  await job.log(`Writing meta.json (${JSON.stringify(meta)})`);

  await uploadJson(`transcode/${params.assetId}/meta.json`, meta);

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
