import type { InterstitialAssetStartedData } from "hls.js";
import type { MixType } from "../..";

export function getAssetListItem(data: InterstitialAssetStartedData): {
  type?: MixType;
} {
  const assetListItem = data.event.assetListResponse?.ASSETS[
    data.assetListIndex
  ] as
    | {
        "MIX-TYPE"?: MixType;
      }
    | undefined;

  return {
    type: assetListItem?.["MIX-TYPE"],
  };
}

export function preciseFloat(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function updateActive<T extends { active: boolean }>(
  items: T[],
  getActive: (item: T) => boolean,
) {
  const current = items.findIndex((item) => item.active);
  const active = items.findIndex((item) => getActive(item));

  if (current === active) {
    return items;
  }

  const nextItems: T[] = [];

  for (const item of items) {
    const nextActive = getActive(item);
    if (item.active === nextActive) {
      nextItems.push(item);
      continue;
    }
    nextItems.push({ ...item, active: nextActive });
  }

  return nextItems;
}
