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

export async function getBinaryPath(name: string) {
  const direct = `${process.cwd()}/bin/${name}`;
  const directExists = await Bun.file(direct).exists();
  if (directExists) {
    return direct;
  }

  const packagesDir = `${import.meta.path.substring(0, import.meta.path.indexOf("/artisan"))}`;
  const local = `${packagesDir}/artisan/bin/${name}`;
  const localExists = await Bun.file(local).exists();
  if (localExists) {
    return local;
  }

  throw new Error(
    `Failed to get bin dep "${name}", run scripts/bin-deps.sh to install binary dependencies.`,
  );
}
