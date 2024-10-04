import type { DateTime } from "luxon";
import type { DateRange, MediaPlaylist, Rendition, Variant } from "./types";

export function appendInterstitial(
  media: MediaPlaylist,
  params: {
    base: DateTime;
    timeOffset: number;
    list: string;
    attrs?: Record<string, string>;
  },
) {
  const clientAttributes = Object.assign(
    {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": params.list,
    },
    params.attrs,
  );

  const dateRange: DateRange = {
    classId: "com.apple.hls.interstitial",
    id: `${params.timeOffset}`,
    startDate: params.base.plus({ seconds: params.timeOffset }),
    clientAttributes,
  };

  if (!media.dateRanges) {
    media.dateRanges = [];
  }

  media.dateRanges.push(dateRange);
}

export function appendRendition(
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
