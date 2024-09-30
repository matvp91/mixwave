import { formatUri } from "./uri.js";
import * as hlsParser from "../extern/hls-parser/index.js";
import {
  MasterPlaylist,
  MediaPlaylist,
  Variant,
  Segment,
} from "../extern/hls-parser/types.js";
import { fetchPlaylist } from "./playlist.js";
import { withPath } from "./uri.js";

export async function getFastMasterPlaylist() {
  const master = new MasterPlaylist({
    independentSegments: true,
    variants: [
      new Variant({
        uri: "playlist.m3u8",
        bandwidth: 8437713,
      }),
    ],
  });

  return hlsParser.stringify(master);
}

export async function getFastMediaPlaylist(path: string) {
  const startDate = Date.now() - 5 * /* MS_PER_MINUTE= */ 60000;

  const items: string[] = [];
  for (let i = 0; i < 20; i++) {
    items.push("468ea987-2c3a-4301-9eca-fb89fd26b79b");
  }

  const segments: Segment[] = [];

  for (const item of items) {
    const format = formatUri(item);
    const url = withPath(format.base, format.file);
    const playlist = await fetchPlaylist<MasterPlaylist>(url);

    const mediaChunkUrl = withPath(format.base, playlist.variants[0].uri);
    const mediaChunkFormat = formatUri(mediaChunkUrl);
    const mediaChunk = await fetchPlaylist<MediaPlaylist>(mediaChunkUrl);

    mediaChunk.segments.forEach((segment, index) => {
      if (segment.map?.uri === "init.mp4") {
        segment.map.uri = withPath(mediaChunkFormat.base, segment.map.uri);
      }

      segment.uri = withPath(mediaChunkFormat.base, segment.uri);

      if (index === mediaChunk.segments.length - 1) {
        segment.discontinuity = true;
      }
    });

    segments.push(...mediaChunk.segments);
  }

  segments[0].programDateTime = new Date(startDate);

  const media = new MediaPlaylist({
    targetDuration: 4,
    segments,
  });

  return hlsParser.stringify(media);
}
