import { Queue, FlowProducer, Job } from "bullmq";
import { connection } from "./connection.js";
import { randomUUID } from "crypto";
import type { Input, Stream } from "./schemas.js";
import type { TranscodeData } from "./consumer/workers/transcode.js";
import type { PackageData } from "./consumer/workers/package.js";
import type { FfmpegData } from "./consumer/workers/ffmpeg.js";
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
  assetId: string;
  inputs: Input[];
  streams: Stream[];
  segmentSize: number;
  package: boolean;
  tag: string;
};

export async function addTranscodeJob(data: AddTranscodeJobData) {
  const jobId = `transcode_${data.assetId}`;

  const pendingJob = await Job.fromId(transcodeQueue, jobId);
  if (pendingJob) {
    return pendingJob;
  }

  let childJobIndex = 0;
  const childJobs: FlowChildJob[] = [];

  for (const stream of data.streams) {
    let input: Input | undefined;

    if (stream.type === "video") {
      input = data.inputs.find((input) => input.type === "video");
    }

    if (stream.type === "audio") {
      input = data.inputs.find(
        (input) => input.type === "audio" && input.language === stream.language,
      );
    }

    if (stream.type === "text") {
      input = data.inputs.find(
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
          parentSortKey: ++childJobIndex,
          input,
          stream,
          segmentSize: data.segmentSize,
          assetId: data.assetId,
        } satisfies FfmpegData,
        queueName: "ffmpeg",
        opts: {
          jobId: `ffmpeg_${randomUUID()}`,
        },
      });
    }
  }

  const { job } = await flowProducer.add({
    name: "transcode",
    queueName: "transcode",
    data: {
      assetId: data.assetId,
      package: data.package,
      tag: data.tag,
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
  tag: string;
};

export async function addPackageJob(data: AddPackageJobData) {
  return await packageQueue.add(
    "package",
    {
      assetId: data.assetId,
      tag: data.tag,
    } satisfies PackageData,
    {
      jobId: `package_${data.assetId}`,
    },
  );
}
