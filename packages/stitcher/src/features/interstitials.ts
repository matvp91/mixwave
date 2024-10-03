import { DateTime } from "luxon";
import { pushInterstitial } from "../parser/index.js";
import type { Interstitial, InterstitialType } from "../types.js";
import type { MediaPlaylist } from "../parser/index.js";

type GroupedInterstitial = {
  timeOffset: number;
  types: InterstitialType[];
};

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

function groupInterstitials(interstitials: Interstitial[]) {
  return interstitials.reduce<GroupedInterstitial[]>((acc, interstitial) => {
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
