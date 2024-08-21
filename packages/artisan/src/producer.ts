import { Queue, FlowProducer } from "bullmq";
import { randomUUID } from "node:crypto";
import { connection } from "./connection.js";
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
};

export async function addTranscodeJob(data: AddTranscodeJobData) {
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

  return await flowProducer.add({
    name: "transcode",
    queueName: "transcode",
    data: {
      assetId: data.assetId,
      package: data.package,
    } satisfies TranscodeData,
    children: childJobs,
    opts: {
      jobId: `transcode_${data.assetId}`,
    },
  });
}

type AddPackageJobData = {
  assetId: string;
};

export async function addPackageJob(data: AddPackageJobData) {
  return await packageQueue.add("package", data, {
    jobId: `package_${data.assetId}`,
  });
}
