import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { contract } from "./contract.js";
import { bullBoardPlugin } from "./plugins/bull-board.js";
import { initServer } from "@ts-rest/fastify";
import { addTranscodeJob, addPackageJob } from "@mixwave/artisan/producer";
import { getJobs, getJob, getRootTreeForJobById, getJobLogs } from "./jobs.js";
import { generateOpenApi } from "@ts-rest/open-api";
import { randomUUID } from "crypto";

async function buildServer() {
  const app = Fastify();

  app.register(cors);

  const s = initServer();

  const router = s.router(contract, {
    postTranscode: async ({ body }) => {
      const job = await addTranscodeJob({
        assetId: randomUUID(),
        ...body,
      });
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
    getJob: async ({ params }) => {
      return {
        status: 200,
        body: {
          job: await getJob(params.id),
          rootTree: await getRootTreeForJobById(params.id),
        },
      };
    },
    getJobLogs: async ({ params }) => {
      return {
        status: 200,
        body: await getJobLogs(params.id),
      };
    },
    getSpec: async () => {
      return {
        status: 200,
        body: generateOpenApi(contract, {
          info: {
            title: "API",
            version: "1.0.0",
          },
        }),
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
