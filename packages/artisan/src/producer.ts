import { Queue, FlowProducer } from "bullmq";
import { randomUUID } from "node:crypto";
import { connection } from "./connection.js";
import type { Input } from "./schemas.js";
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

export async function addTranscodeJob(
  data: Omit<TranscodeData, "assetId"> & { assetId?: string }
) {
  const assetId = data.assetId ?? randomUUID();

  const { inputs, streams, ...restParams } = data;

  const genericOptions = Object.assign(restParams, {
    assetId,
  });

  let childJobIndex = 0;
  const childJobs: FlowChildJob[] = [];

  for (const stream of streams) {
    let input: Input | undefined;

    if (stream.type === "video") {
      input = inputs.find((input) => input.type === "video");
    }

    if (stream.type === "audio") {
      input = inputs.find(
        (input) => input.type === "audio" && input.language === stream.language
      );
    }

    if (stream.type === "text") {
      input = inputs.find(
        (input) => input.type === "text" && input.language === stream.language
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
          ...genericOptions,
        } satisfies FfmpegData,

        queueName: "ffmpeg",
      });
    }
  }

  return await flowProducer.add({
    name: "transcode",
    queueName: "transcode",
    data: {
      assetId,
    },
    children: childJobs,
  });
}

export async function addPackageJob(data: PackageData) {
  return await packageQueue.add("package", data, {
    jobId: randomUUID(),
  });
}
