import { Job, Queue } from "bullmq";
import { env } from "./env.js";

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

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
