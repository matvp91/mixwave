import parseFilePath from "parse-filepath";
import { parsePlaylistParamsPayload } from "./schemas.js";
import { parse, stringify } from "../extern/hls-parser/index.js";
import { Define, Interstitial } from "../extern/hls-parser/types.js";
import { packageBaseUrl } from "./const.js";
import type {
  MasterPlaylist,
  MediaPlaylist,
} from "../extern/hls-parser/types.js";

async function fetchPlaylist<T>(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parse(text) as T;
}

export async function getMasterPlaylist(filePath: string) {
  const file = parseFilePath(filePath);

  const playlist = await fetchPlaylist<MasterPlaylist>(
    `${packageBaseUrl}/${file.path}`,
  );

  playlist.defines.push(
    new Define({
      value: "p",
      type: "QUERYPARAM",
    }),
    new Define({
      name: "packageBaseUrl",
      value: packageBaseUrl,
      type: "NAME",
    }),
  );

  playlist.variants.forEach((variant) => {
    variant.uri = `${variant.uri}?p={$p}`;

    variant.audio.forEach((audioTrack) => {
      audioTrack.uri = `${audioTrack.uri}?p={$p}`;
    });
  });

  return stringify(playlist);
}

export async function getMediaPlaylist(
  filePath: string,
  query: {
    p?: string;
  },
) {
  const file = parseFilePath(filePath);

  const now = Date.now();

  const playlist = await fetchPlaylist<MediaPlaylist>(
    `${packageBaseUrl}/${file.path}`,
  );

  const playlistParams = parsePlaylistParamsPayload(query.p);

  if (playlistParams.interstitials) {
    playlist.segments[0].programDateTime = new Date(now);

    playlistParams.interstitials.forEach((interstitial, index) => {
      playlist.interstitials.push(
        new Interstitial({
          startDate: new Date(now),
          id: `i${index + 1}`,
          uri: `${packageBaseUrl}/${interstitial.assetId}/hls/master.m3u8`,
          duration: 15,
        }),
      );
    });
  }

  if (playlistParams.origSegmentUri) {
    playlist.defines.push(
      new Define({
        value: "packageBaseUrl",
        type: "IMPORT",
      }),
      new Define({
        name: "path",
        value: `{$packageBaseUrl}${file.dir}`,
        type: "NAME",
      }),
    );

    playlist.segments.forEach((segment) => {
      segment.uri = `{$path}/${segment.uri}`;
    });
  }

  return stringify(playlist);
}
