import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import {
  addTranscodeJob,
  addPackageJob,
} from "@superstreamer/artisan/producer";
import {
  LangCodeSchema,
  VideoCodecSchema,
  AudioCodecSchema,
} from "shared/typebox";
import { customCss } from "shared/scalar";
import { env } from "./env";
import { getJob, getJobs, getJobLogs } from "./jobs";
import { getStorageFolder, getStorageFile } from "./s3";
import { StorageFolderSchema, StorageFileSchema, JobSchema } from "./types";

export type App = typeof app;

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Superstreamer API",
          description:
            "The Superstreamer API is organized around REST, returns JSON-encoded responses " +
            "and uses standard HTTP response codes and verbs.",
          version: "1.0.0",
        },
      },
      scalarConfig: {
        hideDownloadButton: true,
        customCss,
      },
    }),
  )
  .model({
    LangCode: LangCodeSchema,
    VideoCodec: VideoCodecSchema,
    AudioCodec: AudioCodecSchema,
    Job: JobSchema,
    StorageFolder: StorageFolderSchema,
    StorageFile: StorageFileSchema,
  })
  .post(
    "/transcode",
    async ({ body }) => {
      const job = await addTranscodeJob(body);
      if (!job.id) {
        throw new Error("Missing job.id");
      }
      return { jobId: job.id };
    },
    {
      detail: {
        summary: "Create transcode job",
      },
      body: t.Object({
        inputs: t.Array(
          t.Union([
            t.Object({
              type: t.Literal("video"),
              path: t.String({
                description:
                  "The source path, starting with http(s):// or s3://",
              }),
            }),
            t.Object({
              type: t.Literal("audio"),
              path: t.String({
                description:
                  "The source path, starting with http(s):// or s3://",
              }),
              language: LangCodeSchema,
            }),
            t.Object({
              type: t.Literal("text"),
              path: t.String({
                description:
                  "The source path, starting with http(s):// or s3://",
              }),
              language: LangCodeSchema,
            }),
          ]),
          {
            description:
              "Source input types. Can refer to the same file, eg: when an mp4 contains " +
              "both audio and video, the same source can be added for both video and audio as type.",
          },
        ),
        streams: t.Array(
          t.Union([
            t.Object({
              type: t.Literal("video"),
              codec: VideoCodecSchema,
              height: t.Number(),
              bitrate: t.Number({ description: "Bitrate in bps" }),
              framerate: t.Number({ description: "Frames per second" }),
            }),
            t.Object({
              type: t.Literal("audio"),
              codec: AudioCodecSchema,
              bitrate: t.Number({ description: "Bitrate in bps" }),
              language: LangCodeSchema,
              channels: t.Number(),
            }),
            t.Object({
              type: t.Literal("text"),
              language: LangCodeSchema,
            }),
          ]),
          {
            description:
              "Output types, the transcoder will match any given input and figure out if a particular output can be generated.",
          },
        ),
        segmentSize: t.Optional(
          t.Number({
            description: "In seconds, will result in proper GOP sizes.",
          }),
        ),
        assetId: t.Optional(
          t.String({
            description:
              "Only provide if you wish to re-transcode an existing asset. When not provided, a unique UUID is created.",
          }),
        ),
        packageAfter: t.Optional(
          t.Boolean({
            description:
              "Starts a default package job after a succesful transcode.",
          }),
        ),
        tag: t.Optional(
          t.String({
            description:
              'Tag a job for a particular purpose, such as "ad". Arbitrary value.',
          }),
        ),
      }),
      response: {
        200: t.Object({
          jobId: t.String(),
        }),
      },
    },
  )
  .post(
    "/package",
    async ({ body }) => {
      const job = await addPackageJob(body);
      if (!job.id) {
        throw new Error("Missing job.id");
      }
      return { jobId: job.id };
    },
    {
      detail: {
        summary: "Create package job",
      },
      body: t.Object({
        assetId: t.String(),
        segmentSize: t.Optional(
          t.Number({
            description:
              "In seconds, shall be the same or a multiple of the originally transcoded segment size.",
          }),
        ),
        tag: t.Optional(
          t.String({
            description:
              'Tag a job for a particular purpose, such as "ad". Arbitrary value.',
          }),
        ),
        name: t.Optional(
          t.String({
            description:
              'When provided, the package result will be stored under this name in S3. Mainly used to create multiple packaged results for a transcode result. We\'ll use "hls" when not provided.',
          }),
        ),
      }),
      response: {
        200: t.Object({
          jobId: t.String(),
        }),
      },
    },
  )
  .get(
    "/jobs",
    async () => {
      return await getJobs();
    },
    {
      detail: {
        summary: "Get all jobs",
      },
      response: {
        200: t.Array(t.Ref(JobSchema)),
      },
    },
  )
  .get(
    "/jobs/:id",
    async ({ params, query }) => {
      return await getJob(params.id, query.fromRoot);
    },
    {
      detail: {
        summary: "Get a job",
      },
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        fromRoot: t.Optional(t.Boolean()),
      }),
      response: {
        200: t.Ref(JobSchema),
      },
    },
  )
  .get(
    "/jobs/:id/logs",
    async ({ params }) => {
      return await getJobLogs(params.id);
    },
    {
      detail: {
        summary: "Get job logs",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Array(t.String()),
      },
    },
  )
  .get(
    "/storage/folder",
    async ({ query }) => {
      return await getStorageFolder(query.path, query.take, query.cursor);
    },
    {
      detail: {
        summary: "Get a storage folder",
        description:
          "Get a folder from your S3 storage by path with all files and subfolders.",
      },
      query: t.Object({
        path: t.String(),
        cursor: t.Optional(t.String()),
        take: t.Optional(t.Number()),
      }),
      response: {
        200: t.Ref(StorageFolderSchema),
      },
    },
  )
  .get(
    "/storage/file",
    async ({ query }) => {
      return await getStorageFile(query.path);
    },
    {
      detail: {
        summary: "Get a storage file",
        description: "Get a single file from storage with raw data.",
      },
      query: t.Object({
        path: t.String(),
      }),
      response: {
        200: t.Ref(StorageFileSchema),
      },
    },
  );

app.on("stop", () => {
  process.exit(0);
});

process
  .on("beforeExit", app.stop)
  .on("SIGINT", app.stop)
  .on("SIGTERM", app.stop);

app.listen(
  {
    port: env.PORT,
    hostname: env.HOST,
  },
  () => {
    console.log(`Started api on port ${env.PORT}`);
  },
);
