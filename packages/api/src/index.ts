import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { contract } from "./contract.js";
import { bullBoardPlugin } from "./plugins/bull-board.js";
import { initServer } from "@ts-rest/fastify";
import { addTranscodeJob, addPackageJob } from "@mixwave/artisan/producer";
import { getJobs, getJob, getJobLogs } from "./jobs.js";
import { openApiSpec } from "./openapi.js";
import { getStorage } from "./s3.js";

async function buildServer() {
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
        body: await getStorage(query.path),
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

  app.register(bullBoardPlugin);

  return app;
}

async function main() {
  const app = await buildServer();
  await app.listen({ host: env.HOST, port: env.PORT });
}

main();
