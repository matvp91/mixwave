import { allQueus, flowProducer } from "@mixwave/artisan/producer";
import { JobNode, Job } from "bullmq";
import extract from "object-property-extractor";
import type { JobDto, JobNodeDto } from "./types.js";

function findQueueByName(name: string) {
  const queue = allQueus.find((queue) => queue.name === name);
  if (!queue) {
    throw new Error("No queue found.");
  }
  return queue;
}

export async function getJobs(): Promise<JobDto[]> {
  const result: JobDto[] = [];
  for (const queue of allQueus) {
    const jobs = await queue.getJobs();

    const filteredJobs = jobs.filter((job) => !job.parent);

    result.push(...(await Promise.all(filteredJobs.map(formatJobDto))));
  }

  result.sort((a, b) => b.createdOn - a.createdOn);

  return result;
}

async function formatJobDto(job: Job): Promise<JobDto> {
  if (!job.id) {
    throw new Error("Missing jobId");
  }

  let progress = 0;
  if (typeof job.progress === "number") {
    progress = job.progress;
  }

  return {
    id: job.id,
    name: job.name,
    state: await job.getState(),
    progress,
    finishedOn: job.finishedOn ?? null,
    processedOn: job.processedOn ?? null,
    createdOn: job.timestamp,
    inputData: JSON.stringify(job.data),
    outputData: job.returnvalue ? JSON.stringify(job.returnvalue) : null,
    failedReason: job.failedReason ?? null,
  };
}

export async function getJobLogs(id: string) {
  const queueName = id.split("_", 1)[0];
  const queue = findQueueByName(queueName);

  const { logs } = await queue.getJobLogs(id);

  return logs;
}

export async function getJob(id: string) {
  const queueName = id.split("_", 1)[0];
  const queue = findQueueByName(queueName);

  const job = await Job.fromId(queue, id);
  if (!job) {
    throw new Error("No job found.");
  }

  return await formatJobDto(job);
}

async function formatJobNodeDto(node: JobNode): Promise<JobNodeDto> {
  const children = node.children ?? [];

  const findParentSortKey = (obj: unknown) =>
    extract(obj, "data.parentSortKey", 0);
  children.sort((a, b) => findParentSortKey(a.job) - findParentSortKey(b.job));

  return {
    job: await formatJobDto(node.job),
    children: await Promise.all(children.map(formatJobNodeDto)),
  };
}

export async function getRootTreeForJob(job: Job) {
  while (job.parent) {
    // TODO: Replacing bull internals is not a good idea, find another way to
    // properly get queue.
    const queue = findQueueByName(job.parent.queueKey.replace("bull:", ""));
    const parentJob = await Job.fromId(queue, job.parent.id);
    if (!parentJob) {
      throw new Error("No parent job found.");
    }
    job = parentJob;
  }

  if (!job.id) {
    throw new Error("Missing job id.");
  }

  const node = await flowProducer.getFlow({
    id: job.id,
    queueName: job.queueName,
  });

  return await formatJobNodeDto(node);
}

export async function getRootTreeForJobById(id: string) {
  const queueName = id.split("_", 1)[0];
  const queue = findQueueByName(queueName);

  const job = await Job.fromId(queue, id);
  if (!job) {
    throw new Error("No job found.");
  }

  return await getRootTreeForJob(job);
}
