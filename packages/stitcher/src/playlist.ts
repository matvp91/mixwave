import { parse, stringify } from "../extern/hls-parser/index.js";
import { Define, Interstitial } from "../extern/hls-parser/types.js";
import parseFilepath from "parse-filepath";
import { MasterPlaylist, MediaPlaylist } from "../extern/hls-parser/types.js";
import type { PlaylistParams } from "./schemas.js";

async function fetchPlaylist<T>(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parse(text) as T;
}

async function fetchDuration(url: string) {
  const master = await fetchPlaylist<MasterPlaylist>(url);
  const filePath = parseFilepath(url);

  const media = await fetchPlaylist<MediaPlaylist>(
    `${filePath.dir}/${master.variants[0].uri}`,
  );

  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}

export async function formatMasterPlaylist(url: string) {
  const master = await fetchPlaylist<MasterPlaylist>(url);

  return stringify(master);
}

export async function formatMediaPlaylist(url: string, params: PlaylistParams) {
  const media = await fetchPlaylist<MediaPlaylist>(url);

  const filePath = parseFilepath(url);

  media.defines.push(
    new Define({
      name: "d",
      value: `${filePath.dir}`,
      type: "NAME",
    }),
  );

  if (params.interstitials) {
    const now = Date.now();
    media.segments[0].programDateTime = new Date(now);

    let id = 1;
    for (const interstitial of params.interstitials) {
      media.interstitials.push(
        new Interstitial({
          startDate: new Date(now + interstitial.offset * 1000),
          id: `${id++}`,
          uri: interstitial.url,
          duration: await fetchDuration(interstitial.url),
        }),
      );
    }
  }

  for (const segment of media.segments) {
    if (segment.map.uri === "init.mp4") {
      segment.map.uri = `{$d}/init.mp4`;
    }

    segment.uri = `{$d}/${segment.uri}`;
  }

  return stringify(media);
}
