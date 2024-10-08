import { initContract } from "@ts-rest/core";
import * as z from "zod";

const c = initContract();

const postSessionBodySchema = z.object({
  uri: z.string(),
  interstitials: z
    .array(
      z.object({
        timeOffset: z.number(),
        uri: z.string(),
        type: z.enum(["ad", "bumper"]).optional(),
      }),
    )
    .optional(),
  filter: z
    .object({
      resolution: z.string().optional(),
    })
    .optional(),
  vmap: z
    .object({
      url: z.string(),
    })
    .optional(),
});

export const contract = c.router({
  postSession: {
    method: "POST",
    path: "/session",
    body: postSessionBodySchema,
    responses: {},
  },
  getMasterPlaylist: {
    method: "GET",
    path: "/session/:sessionId/master.m3u8",
    responses: {},
  },
  getAssetList: {
    method: "GET",
    path: "/session/:sessionId/asset-list.json",
    query: z.object({
      startDate: z.string(),
    }),
    responses: {},
  },
  getMediaPlaylist: {
    method: "GET",
    path: "/session/:sessionId/*",
    responses: {},
  },
  getSpec: {
    method: "GET",
    path: "/spec.json",
    responses: {},
  },
});
