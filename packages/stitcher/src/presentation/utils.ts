import { parseMasterPlaylist, parseMediaPlaylist } from "../parser/index.js";
import { getDir, joinPath } from "../url.js";
import type { MediaPlaylist } from "../parser/index.js";

export function rewriteSegmentToAbsolute(media: MediaPlaylist, dir: string) {
  for (const segment of media.segments) {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = joinPath(dir, segment.map.uri);
    }
    segment.uri = joinPath(dir, segment.uri);
  }
}

export async function fetchPlaylistDuration(url: string) {
  const master = await parseMasterPlaylist(await fetchText(url));

  const media = await parseMediaPlaylist(
    await fetchText(joinPath(getDir(url), master.variants[0].uri)),
  );

  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}

async function fetchText(url: string) {
  const response = await fetch(url);
  return await response.text();
}
