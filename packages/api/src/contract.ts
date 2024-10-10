import { initContract } from "@ts-rest/core";
import { streamSchema, inputSchema } from "@mixwave/shared/schema";
import * as z from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import {
  jobDtoSchema,
  folderContentDtoSchema,
  fileDtoSchema,
} from "./types.js";

extendZodWithOpenApi(z);

const c = initContract();

export const postTranscodeBodySchema = z.object({
  inputs: z.array(inputSchema).openapi({
    description: "The different input media.",
  }),
  streams: z.array(streamSchema).openapi({
    description: "Streams that need to be produced.",
  }),
  segmentSize: z.number().optional().openapi({
    default: 4,
    description:
      "Inserts a keyframe at the start of each segment. When packaging, you can vary segmentSize as the same or a multiple of this.",
  }),
  assetId: z.string().uuid().optional().openapi({
    description:
      "Will override when specified but it is advised to leave this blank and have it auto generate a UUID.",
  }),
  packageAfter: z.boolean().optional().openapi({
    default: false,
    description:
      "When transcode is finished, package it immediately with all default settings.",
  }),
  tag: z.string().optional().openapi({
    description: "An arbitrary tag, used to group jobs.",
  }),
});

export const postPackageBodySchema = z.object({
  assetId: z.string(),
  segmentSize: z
    .number()
    .optional()
    .openapi({
      description:
        "Segment size. When defined, must be equal or a multiple of the segmentSize defined in transcode. " +
        "When not defined, will take the original segmentSize from transcode.",
    }),
  tag: z.string().optional().openapi({
    description: "An arbitrary tag, used to group jobs.",
  }),
  name: z.string().optional().openapi({
    default: "hls",
    description: "The name of the package, will be used in storage.",
  }),
});

export const contract = c.router({
  postTranscode: {
    method: "POST",
    path: "/transcode",
    body: postTranscodeBodySchema,
    responses: {
      200: z.object({
        jobId: z.string(),
      }),
    },
    description: "Convert your source files and prepare them for packaging.",
  },
  postPackage: {
    method: "POST",
    path: "/package",
    body: postPackageBodySchema,
    responses: {
      200: z.object({
        jobId: z.string(),
      }),
    },
    description: "Package your asset to HLS.",
  },
  getJobs: {
    method: "GET",
    path: "/jobs",
    responses: {
      200: z.array(jobDtoSchema),
    },
  },
  getJob: {
    method: "GET",
    path: "/jobs/:id",
    responses: {
      200: jobDtoSchema,
    },
    query: z.object({
      fromRoot: z.coerce.boolean().optional(),
    }),
  },
  getStorage: {
    method: "GET",
    path: "/storage",
    responses: {
      200: z.object({
        cursor: z.string().optional(),
        contents: z.array(folderContentDtoSchema),
      }),
    },
    query: z.object({
      path: z.string(),
      cursor: z.string().optional(),
      take: z.coerce.number().optional(),
    }),
  },
  getStorageFile: {
    method: "GET",
    path: "/storage/file",
    responses: {
      200: fileDtoSchema,
    },
    query: z.object({
      path: z.string(),
    }),
  },
  getJobLogs: {
    method: "GET",
    path: "/jobs/:id/logs",
    responses: {
      200: z.array(z.string()),
    },
  },
  getSpec: {
    method: "GET",
    path: "/spec.json",
    responses: {
      // We can disable this, it's the spec, we don't need to know the inner types.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      200: c.type<Record<string, any>>(),
    },
  },
});
