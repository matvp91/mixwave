import type { DateTime } from "luxon";
import type { DateRange, MediaPlaylist, Rendition, Variant } from "./types";

type PushInterstitialParams = {
  base: DateTime;
  timeOffset: number;
  list: string;
  attrs?: Record<string, string>;
};

export function pushInterstitial(
  media: MediaPlaylist,
  { base, timeOffset, list, attrs }: PushInterstitialParams,
) {
  const clientAttributes = Object.assign(
    {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": list,
    },
    attrs,
  );

  const dateRange: DateRange = {
    classId: "com.apple.hls.interstitial",
    id: `${timeOffset}`,
    startDate: base.plus({ seconds: timeOffset }),
    clientAttributes,
  };

  if (!media.dateRanges) {
    media.dateRanges = [];
  }

  media.dateRanges.push(dateRange);
}

export function pushRendition(
  type: "audio" | "subtitles",
  variant: Variant,
  rendition: Rendition,
) {
  if (type === "audio") {
    if (!variant.audio) {
      variant.audio = [];
    }
    variant.audio.push(rendition);
  }
  if (type === "subtitles") {
    if (!variant.subtitles) {
      variant.subtitles = [];
    }
    variant.subtitles.push(rendition);
  }
}
