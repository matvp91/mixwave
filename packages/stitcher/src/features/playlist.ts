import { parseMasterPlaylist, parseMediaPlaylist } from "../parser/index.js";
import { formatUri, withPath } from "../uri.js";
import type { MediaPlaylist } from "../parser/index.js";
import type { Format } from "../uri.js";

async function fetchText(url: string) {
  const response = await fetch(url);
  return await response.text();
}

export async function fetchMasterPlaylist(url: string) {
  const text = await fetchText(url);
  return parseMasterPlaylist(text);
}

export async function fetchMediaPlaylist(url: string) {
  const text = await fetchText(url);
  return parseMediaPlaylist(text);
}

export function rewriteSegmentToAbsolute(media: MediaPlaylist, format: Format) {
  for (const segment of media.segments) {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = withPath(format.base, segment.map.uri);
    }
    segment.uri = withPath(format.base, segment.uri);
  }
}

export async function getPlaylistDuration(url: string) {
  const format = formatUri(url);

  const master = await fetchMasterPlaylist(url);

  const mediaUrl = withPath(format.base, master.variants[0].uri);
  const media = await fetchMediaPlaylist(mediaUrl);

  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}
