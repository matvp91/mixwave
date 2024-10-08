import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { contract } from "./contract.js";
import { initServer } from "@ts-rest/fastify";
import { addTranscodeJob, addPackageJob } from "@mixwave/artisan/producer";
import { getJobs, getJob, getJobLogs } from "./jobs.js";
import { openApiSpec } from "./openapi.js";
import { getStorage, getStorageFile } from "./s3.js";
import type { FastifyInstance } from "fastify";

async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify();

  app.register(cors);

  const s = initServer();

  const router = s.router(contract, {
    postTranscode: async ({ body }) => {
      const job = await addTranscodeJob(body);
      return {
        status: 201,
        body: { jobId: job.id },
      };
    },
    postPackage: async ({ body }) => {
      const job = await addPackageJob(body);
      return {
        status: 201,
        body: { jobId: job.id },
      };
    },
    getJobs: async () => {
      return {
        status: 200,
        body: await getJobs(),
      };
    },
    getJob: async ({ params, query }) => {
      return {
        status: 200,
        body: await getJob(params.id, query.fromRoot),
      };
    },
    getJobLogs: async ({ params }) => {
      return {
        status: 200,
        body: await getJobLogs(params.id),
      };
    },
    getStorage: async ({ query }) => {
      return {
        status: 200,
        body: await getStorage(query.path, query.take, query.cursor),
      };
    },
    getStorageFile: async ({ query }) => {
      return {
        status: 200,
        body: await getStorageFile(query.path),
      };
    },
    getSpec: async () => {
      return {
        status: 200,
        body: openApiSpec,
      };
    },
  });

  app.register(s.plugin(router));

  return await app;
}

async function main(): Promise<void> {
  const app = await buildServer();
  await app.listen({ host: env.HOST, port: env.PORT });
}

void main();
