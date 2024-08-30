import { initContract } from "@ts-rest/core";
import { streamSchema, inputSchema } from "@mixwave/artisan/schemas";
import * as z from "zod";
import type { JobDto } from "./types.js";

const c = initContract();

export const postTranscodeBodySchema = z.object({
  inputs: z.array(inputSchema),
  streams: z.array(streamSchema),
  segmentSize: z.number().default(4),
  assetId: z.string().uuid().optional(),
  package: z.boolean().default(false),
  tag: z.string().default("default"),
});

export const postPackageBodySchema = z.object({
  assetId: z.string(),
  segmentSize: z.number().default(4),
  tag: z.string().default("default"),
});

export const contract = c.router({
  postTranscode: {
    method: "POST",
    path: "/transcode",
    body: postTranscodeBodySchema,
    responses: {
      200: c.type<{ jobId: string }>(),
    },
    description: "Convert your source files and prepare them for packaging.",
  },
  postPackage: {
    method: "POST",
    path: "/package",
    body: postPackageBodySchema,
    responses: {
      200: c.type<{ jobId: string }>(),
    },
    description: "Package your asset to HLS.",
  },
  getJobs: {
    method: "GET",
    path: "/jobs",
    responses: {
      200: c.type<JobDto[]>(),
    },
  },
  getJob: {
    method: "GET",
    path: "/jobs/:id",
    responses: {
      200: c.type<JobDto>(),
    },
    query: z.object({
      fromRoot: z.coerce.boolean().default(false),
    }),
  },
  getJobLogs: {
    method: "GET",
    path: "/jobs/:id/logs",
    responses: {
      200: c.type<string[]>(),
    },
  },
  getSpec: {
    method: "GET",
    path: "/spec.json",
    responses: {},
  },
});
