import type { DateTime } from "luxon";
import type { DateRange } from "./types";

type CreateDateRangeInterstitialParams = {
  base: DateTime;
  timeOffset: number;
  list: string;
  attrs?: Record<string, string>;
};

export function createDateRangeInterstitial({
  base,
  timeOffset,
  list,
  attrs,
}: CreateDateRangeInterstitialParams): DateRange {
  const clientAttributes = Object.assign(
    {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": list,
    },
    attrs,
  );

  return {
    classId: "com.apple.hls.interstitial",
    id: `${timeOffset}`,
    startDate: base.plus({ seconds: timeOffset }),
    clientAttributes,
  };
}
