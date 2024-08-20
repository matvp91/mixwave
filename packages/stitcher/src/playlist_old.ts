// import parseFilePath from "parse-filepath";
// import { parsePlaylistParamsPayload } from "./schemas.js";
// import { parse, stringify } from "../extern/hls-parser/index.js";
// import { Define, Interstitial } from "../extern/hls-parser/types.js";
// import { packageBaseUrl } from "./const.js";
// import type {
//   MasterPlaylist,
//   MediaPlaylist,
// } from "../extern/hls-parser/types.js";
// import type { ParsedPath } from "parse-filepath";
// import type { PlaylistParams } from "./schemas.js";

// type PlaylistType = "master" | "media";

// type QueryParams = {
//   p?: string;
// };

// export async function fetchPlaylist(url: string) {
//   const response = await fetch(url);
//   const text = await response.text();
//   return parse(text);
// }

// export async function getPlaylist(
//   type: PlaylistType,
//   filePath: string,
//   query: QueryParams,
// ) {
//   const file = parseFilePath(filePath);

//   const playlist = await fetchPlaylist(`${packageBaseUrl}/${file.path}`);

//   const playlistParams = parsePlaylistParamsPayload(query.p);

//   if (type === "master") {
//     mutateMasterPlaylist(file, playlist as MasterPlaylist, playlistParams);
//   }
//   if (type === "media") {
//     mutateMediaPlaylist(file, playlist as MediaPlaylist, playlistParams);
//   }

//   return stringify(playlist);
// }

// export async function mutateMasterPlaylist(
//   file: ParsedPath,
//   playlist: MasterPlaylist,
//   playlistParams: PlaylistParams,
// ) {
//   playlist.defines.push(
//     new Define({
//       value: "p",
//       type: "QUERYPARAM",
//     }),
//   );

//   playlist.variants.forEach((variant) => {
//     variant.uri = `${variant.uri}?p={$p}`;

//     variant.audio.forEach((audioTrack) => {
//       audioTrack.uri = `${audioTrack.uri}?p={$p}`;
//     });
//   });
// }

// export async function mutateMediaPlaylist(
//   file: ParsedPath,
//   playlist: MediaPlaylist,
//   playlistParams: PlaylistParams,
// ) {
//   const now = Date.now();

//   if (playlistParams.interstitials) {
//     playlist.segments[0].programDateTime = new Date(now);

//     playlistParams.interstitials.forEach((interstitial, index) => {
//       playlist.interstitials.push(
//         new Interstitial({
//           startDate: new Date(now),
//           id: `i${index + 1}`,
//           uri: `${packageBaseUrl}/${interstitial.assetId}/hls/master.m3u8`,
//           duration: 15,
//         }),
//       );
//     });
//   }
// }
