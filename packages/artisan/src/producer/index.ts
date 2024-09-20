import { Queue, FlowProducer, Job } from "bullmq";
import { connection } from "../connection.js";
import { randomUUID } from "crypto";
import type { Input, Stream } from "@mixwave/shared/artisan";
import type { TranscodeData } from "../consumer/workers/transcode.js";
import type { PackageData } from "../consumer/workers/package.js";
import type { FfmpegData } from "../consumer/workers/ffmpeg.js";
import type { FlowChildJob } from "bullmq";

export const flowProducer = new FlowProducer({
  connection,
});

const transcodeQueue = new Queue<TranscodeData>("transcode", {
  connection,
});

const packageQueue = new Queue<PackageData>("package", {
  connection,
});

const ffmpegQueue = new Queue<FfmpegData>("ffmpeg", {
  connection,
});

/**
 * Export all available queues so we can read them elsewhere, such as in api
 * where we can build job stats for each queue.
 */
export const allQueus = [transcodeQueue, packageQueue, ffmpegQueue];

type AddTranscodeJobData = {
  assetId?: string;
  inputs: Input[];
  streams: Stream[];
  segmentSize: number;
  packageAfter: boolean;
  tag?: string;
};

export async function addTranscodeJob({
  assetId = randomUUID(),
  inputs,
  streams,
  segmentSize,
  packageAfter,
  tag,
}: AddTranscodeJobData) {
  const jobId = `transcode_${assetId}`;

  const pendingJob = await Job.fromId(transcodeQueue, jobId);
  if (pendingJob) {
    return pendingJob;
  }

  let childJobIndex = 0;
  const childJobs: FlowChildJob[] = [];

  for (const stream of streams) {
    let input: Input | undefined;

    if (stream.type === "video") {
      input = inputs.find((input) => input.type === "video");
    }

    if (stream.type === "audio") {
      input = inputs.find(
        (input) => input.type === "audio" && input.language === stream.language,
      );
    }

    if (stream.type === "text") {
      input = inputs.find(
        (input) => input.type === "text" && input.language === stream.language,
      );
    }

    if (input) {
      const params: string[] = [stream.type];
      if (stream.type === "video") {
        params.push(stream.height.toString());
      }
      if (stream.type === "audio" || stream.type === "text") {
        params.push(stream.language);
      }

      childJobs.push({
        name: `ffmpeg(${params.join(",")})`,
        data: {
          params: {
            input,
            stream,
            segmentSize,
            assetId,
          },
          metadata: {
            parentSortKey: ++childJobIndex,
          },
        } satisfies FfmpegData,
        queueName: "ffmpeg",
        opts: {
          jobId: `ffmpeg_${randomUUID()}`,
          failParentOnFailure: true,
        },
      });
    }
  }

  const { job } = await flowProducer.add({
    name: "transcode",
    queueName: "transcode",
    data: {
      params: {
        assetId,
        segmentSize,
        packageAfter,
      },
      metadata: {
        tag,
      },
    } satisfies TranscodeData,
    children: childJobs,
    opts: {
      jobId,
    },
  });

  return job;
}

type AddPackageJobData = {
  assetId: string;
  segmentSize: number;
  tag?: string;
};

export async function addPackageJob(data: AddPackageJobData) {
  return await packageQueue.add(
    "package",
    {
      params: {
        assetId: data.assetId,
        segmentSize: data.segmentSize,
      },
      metadata: {
        tag: data.tag,
      },
    } satisfies PackageData,
    {
      jobId: `package_${data.assetId}`,
    },
  );
}
