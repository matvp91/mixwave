import { initContract } from "@ts-rest/core";
import * as z from "zod";

const c = initContract();

export const postSessionBodySchema = z.object({
  assetId: z.string(),
  vmapUrl: z.string().optional(),
  ads: z
    .array(
      z.object({
        timeOffset: z.number(),
        assetId: z.string(),
      }),
    )
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
  getMediaPlaylist: {
    method: "GET",
    path: "/session/:sessionId/:path/playlist.m3u8",
    responses: {},
  },
  getInterstitialsList: {
    method: "GET",
    path: "/interstitials/:sessionId/list.json",
    query: z.object({
      offset: z.coerce.number(),
    }),
    responses: {},
  },
  unstable_getDirectMasterPlaylist: {
    method: "GET",
    path: "/_direct/master.m3u8",
    query: z.object({
      params: z.string(),
    }),
    responses: {},
  },
});
