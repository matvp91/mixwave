import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { addTranscodeJob, addPackageJob } from "@mixwave/artisan-producer";
import { inputSchema, streamSchema } from "@mixwave/artisan-producer/schemas";
import { env } from "./env";
import { getJob, getJobs, getJobLogs } from "./jobs";
import { getStorage, getStorageFile } from "./s3";

export type App = typeof app;

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .post(
    "/transcode",
    async ({ body }) => {
      const job = await addTranscodeJob(body);
      return { jobId: job.id };
    },
    {
      body: t.Object({
        inputs: t.Array(inputSchema),
        streams: t.Array(streamSchema),
        segmentSize: t.Optional(t.Number()),
        assetId: t.Optional(t.String()),
        packageAfter: t.Optional(t.Boolean()),
        tag: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/package",
    async ({ body }) => {
      const job = await addPackageJob(body);
      return { jobId: job.id };
    },
    {
      body: t.Object({
        assetId: t.String(),
        segmentSize: t.Optional(t.Number()),
        tag: t.Optional(t.String()),
        name: t.Optional(t.String()),
      }),
    },
  )
  .get("/jobs", async () => {
    return await getJobs();
  })
  .get(
    "/jobs/:id",
    async ({ params, query }) => {
      return await getJob(params.id, query.fromRoot);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        fromRoot: t.Optional(t.Boolean()),
      }),
    },
  )
  .get(
    "/jobs/:id/logs",
    async ({ params }) => {
      return await getJobLogs(params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/storage",
    async ({ query }) => {
      return await getStorage(query.path, query.take, query.cursor);
    },
    {
      query: t.Object({
        path: t.String(),
        cursor: t.Optional(t.String()),
        take: t.Optional(t.Number()),
      }),
    },
  )
  .get(
    "/storage/file",
    async ({ query }) => {
      return await getStorageFile(query.path);
    },
    {
      query: t.Object({
        path: t.String(),
      }),
    },
  );

app.listen({
  port: env.PORT,
  hostname: env.HOST,
});
