import { parse, stringify } from "../extern/hls-parser/index.js";
import { Define } from "../extern/hls-parser/types.js";
import parseFilepath from "parse-filepath";
import type {
  MasterPlaylist,
  MediaPlaylist,
} from "../extern/hls-parser/types.js";

async function fetchPlaylist<T>(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parse(text) as T;
}

export async function masterPlaylist(url: string) {
  const master = await fetchPlaylist<MasterPlaylist>(url);

  return stringify(master);
}

export async function mediaPlaylist(url: string) {
  const media = await fetchPlaylist<MediaPlaylist>(url);

  const filePath = parseFilepath(url);
  console.log(filePath);

  media.defines.push(
    new Define({
      name: "d",
      value: `${filePath.dir}`,
      type: "NAME",
    }),
  );

  for (const segment of media.segments) {
    if (segment.map.uri === "init.mp4") {
      segment.map.uri = `{$d}/init.mp4`;
    }

    segment.uri = `{$d}/${segment.uri}`;
  }

  return stringify(media);
}
