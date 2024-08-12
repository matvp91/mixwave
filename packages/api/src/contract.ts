import { initContract } from "@ts-rest/core";
import { streamSchema, inputSchema } from "@mixwave/artisan/schemas";
import { playlistParamsSchema } from "@mixwave/stitcher/schemas";
import * as z from "zod";
import type { JobDto, JobNodeDto } from "./types.js";

const c = initContract();

export const postTranscodeBodySchema = z.object({
  inputs: z.array(inputSchema),
  streams: z.array(streamSchema),
  segmentSize: z.number(),
  assetId: z.string().optional(),
});

export const postPackageBodySchema = z.object({
  assetId: z.string(),
});

export const contract = c.router({
  postTranscode: {
    method: "POST",
    path: "/transcode",
    body: postTranscodeBodySchema,
    responses: {},
    description: "Convert your source files and prepare them for packaging.",
  },
  postPackage: {
    method: "POST",
    path: "/package",
    body: postPackageBodySchema,
    responses: {},
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
      200: c.type<{
        job: JobDto;
        rootTree: JobNodeDto;
      }>(),
    },
  },
  postPlaylist: {
    method: "POST",
    path: "/playlist/:assetId",
    body: playlistParamsSchema,
    responses: {
      200: c.type<{
        url: string;
      }>(),
    },
  },
  getSpec: {
    method: "GET",
    path: "/spec.json",
    responses: {},
  },
});
