import { initContract } from "@ts-rest/core";
import * as z from "zod";

const c = initContract();

const postSessionBodySchema = z.object({
  uri: z.string(),
  vmap: z
    .object({
      url: z.string(),
    })
    .optional(),
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
      timeOffset: z.coerce.number(),
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
