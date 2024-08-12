import { createPlaylistParamsPayload } from "@mixwave/stitcher/schemas";
import type { PlaylistParams } from "@mixwave/stitcher/schemas";
import { env } from "./env.js";

export function getPlaylistUrl(id: string, params: PlaylistParams) {
  const payload = createPlaylistParamsPayload(params);
  return `${env.STITCHER_URL}/out/${id}/hls/master.m3u8?p=${payload}`;
}
