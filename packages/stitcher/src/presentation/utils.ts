import { formatUri, withPath } from "../uri.js";
import { parseMasterPlaylist, parseMediaPlaylist } from "../parser/index.js";
import { DateTime } from "luxon";
import { pushInterstitial } from "../parser/index.js";
import type { Interstitial, InterstitialType } from "../types.js";
import type { MediaPlaylist } from "../parser/index.js";
import type { Format } from "../uri.js";

export function rewriteSegmentToAbsolute(media: MediaPlaylist, format: Format) {
  for (const segment of media.segments) {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = withPath(format.base, segment.map.uri);
    }
    segment.uri = withPath(format.base, segment.uri);
  }
}

export async function fetchPlaylistDuration(url: string) {
  const format = formatUri(url);

  const master = await parseMasterPlaylist(await fetchText(url));

  const mediaUrl = withPath(format.base, master.variants[0].uri);
  const media = await parseMediaPlaylist(await fetchText(url));

  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}

export function addInterstitialsToMedia(
  media: MediaPlaylist,
  interstitials: Interstitial[],
  sessionId: string,
) {
  if (!interstitials.length) {
    // If we have no interstitials, there is nothing to insert and
    // we can bail out early.
    return;
  }

  const now = DateTime.now();
  media.segments[0].programDateTime = now;

  const groups = groupInterstitials(interstitials);

  groups.forEach((item) => {
    pushInterstitial(media, {
      base: now,
      timeOffset: item.timeOffset,
      list: `/session/${sessionId}/asset-list.json?timeOffset=${item.timeOffset}`,
      attrs: {
        "MIX-TYPES": item.types.join(","),
      },
    });
  });
}

async function fetchText(url: string) {
  const response = await fetch(url);
  return await response.text();
}

function groupInterstitials(interstitials: Interstitial[]) {
  type $Interstitial = {
    timeOffset: number;
    types: InterstitialType[];
  };

  return interstitials.reduce<$Interstitial[]>((acc, interstitial) => {
    let foundItem = acc.find(
      (item) => item.timeOffset === interstitial.timeOffset,
    );
    if (!foundItem) {
      foundItem = {
        timeOffset: interstitial.timeOffset,
        types: [],
      };
      acc.push(foundItem);
    }

    if (interstitial.type && !foundItem.types.includes(interstitial.type)) {
      foundItem.types.push(interstitial.type);
    }

    return acc;
  }, []);
}
