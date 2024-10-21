import { langMap } from "./lang-map";
import type {
  InterstitialAssetStartedData,
  InterstitialScheduleItem,
} from "hls.js";
import type { CustomInterstitialType, State } from "./types";
import type { Asset } from "./asset";

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

export function preciseFloat(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getLang(key?: string) {
  const value = key ? langMap[key]?.split(",")[0] : null;
  return value ?? "Unknown";
}

export function getAssetListItem(data: InterstitialAssetStartedData): {
  type?: CustomInterstitialType;
} {
  const assetListItem = data.event.assetListResponse?.ASSETS[
    data.assetListIndex
  ] as
    | {
        "SPRS-TYPE"?: CustomInterstitialType;
      }
    | undefined;

  return {
    type: assetListItem?.["SPRS-TYPE"],
  };
}

export function getTypes(item: InterstitialScheduleItem) {
  if (!item.event) {
    return null;
  }
  return item.event.dateRange.attr.enumeratedStringList("X-SPRS-TYPES", {
    ad: false,
    bumper: false,
  } satisfies Record<CustomInterstitialType, boolean>);
}

const noState: State = {
  playhead: "idle",
  started: false,
  time: 0,
  duration: NaN,
  volume: 0,
  autoQuality: false,
  qualities: [],
  audioTracks: [],
  subtitleTracks: [],
};

export function pipeState<P extends keyof State>(
  prop: P,
  asset: Asset | null,
): State[P] {
  if (!asset) {
    return noState[prop];
  }
  return asset.state[prop];
}
