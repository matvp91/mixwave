import { initContract } from "@ts-rest/core";
import * as z from "zod";
import base64 from "hi-base64";

const c = initContract();

const sessionParams = z.object({
  vmapUrl: z.string().optional(),
  interstitials: z
    .array(
      z.object({
        timeOffset: z.number(),
        assetId: z.string(),
      }),
    )
    .optional(),
  bumperAssetId: z.string().optional(),
  maxResolution: z.coerce.number().optional(),
});

export const postSessionBodySchema = z
  .object({
    assetId: z.string(),
  })
  .merge(sessionParams);

export const getDirectMasterPlaylistQuerySchema = z
  .object({
    params: base64Type(sessionParams).optional(),
  })
  .merge(sessionParams);

export const contract = c.router({
  postSession: {
    method: "POST",
    path: "/session",
    body: postSessionBodySchema,
    responses: {},
  },
  getDirectMasterPlaylist: {
    method: "GET",
    path: "/direct/:assetId/master.m3u8",
    responses: {},
    query: getDirectMasterPlaylistQuerySchema,
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
  getAssetList: {
    method: "GET",
    path: "/session/:sessionId/asset-list.json",
    query: z.object({
      timeOffset: z.coerce.number(),
    }),
    responses: {},
  },
  getSpec: {
    method: "GET",
    path: "/spec.json",
    responses: {},
  },
});

function base64Type<T extends z.AnyZodObject>(schema: T) {
  return z.string().transform((value) => {
    const raw = base64.decode(value);
    const obj = JSON.parse(raw);
    return schema.parse(obj);
  });
}

function recursiveToCamel(item: unknown) {
  if (Array.isArray(item)) {
    return item.map((el: unknown) => recursiveToCamel(el));
  } else if (typeof item === "function" || item !== Object(item)) {
    return item;
  }
  return Object.fromEntries(
    Object.entries(item as Record<string, unknown>).map(
      ([key, value]: [string, unknown]) => [
        key.replace(/([-_][a-z])/gi, (c) =>
          c.toUpperCase().replace(/[-_]/g, ""),
        ),
        recursiveToCamel(value),
      ],
    ),
  );
}
