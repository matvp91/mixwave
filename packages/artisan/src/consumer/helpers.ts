import { Job, Queue } from "bullmq";
import { connection } from "./env";

/**
 * Gets the full job. This is particularly handy when you need
 * children values from child jobs.
 * @param job Full job
 * @returns
 */
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
