import { DateTime } from "luxon";
import { env } from "./env.js";
import { getMasterUrl } from "./url.js";
import { getAdMediasFromVast } from "./vast.js";
import { fetchPlaylistDuration } from "./presentation/utils.js";
import { VmapResponse } from "./vmap.js";
import type { DateRange } from "./parser/types.js";
import type {
  InterstitialAsset,
  Session,
  SessionInterstitialType,
  SessionInterstitial,
} from "./types.js";

export function formatDateRanges(session: Session) {
  if (!session.programDateTime) {
    return null;
  }

  const group: Record<string, SessionInterstitialType[]> = {};

  if (session.vmapResponse) {
    for (const adBreak of session.vmapResponse.adBreaks) {
      groupTimeOffset(group, session.programDateTime, adBreak.timeOffset, "ad");
    }
  }
  if (session.interstitials) {
    for (const interstitial of session.interstitials) {
      groupTimeOffset(
        group,
        session.programDateTime,
        interstitial.timeOffset,
        interstitial.type,
      );
    }
  }

  return Object.entries(group).map<DateRange>(([startDate, types], index) => {
    const clientAttributes = {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": `${env.PUBLIC_STITCHER_ENDPOINT}/session/${session.id}/asset-list.json?startDate=${encodeURIComponent(startDate)}`,
    };

    if (types.length) {
      clientAttributes["MIX-TYPES"] = types.join(",");
    }

    return {
      classId: "com.apple.hls.interstitial",
      id: `i${index}`,
      startDate: DateTime.fromISO(startDate),
      clientAttributes,
    };
  });
}

function groupTimeOffset(
  group: Record<string, SessionInterstitialType[]>,
  startDate: string,
  timeOffset: number,
  type?: SessionInterstitialType,
) {
  const date = DateTime.fromISO(startDate)
    .plus({ seconds: timeOffset })
    .toISO();
  if (!date) {
    return;
  }

  if (!group[date]) {
    group[date] = [];
  }

  if (type) {
    group[date].push(type);
  }
}

export async function getAssets(session: Session, startDate: string) {
  const assets: InterstitialAsset[] = [];

  if (session.programDateTime) {
    if (session.vmapResponse) {
      await formatAdBreaks(
        assets,
        session.vmapResponse,
        session.programDateTime,
        startDate,
      );
    }

    if (session.interstitials) {
      await formatInterstitials(
        assets,
        session.interstitials,
        session.programDateTime,
        startDate,
      );
    }
  }

  return assets;
}

async function formatAdBreaks(
  assets: InterstitialAsset[],
  vmapResponse: VmapResponse,
  baseDate: string,
  lookupDate: string,
) {
  const date = DateTime.fromISO(baseDate);

  const adBreak = vmapResponse.adBreaks.find((adBreak) =>
    isEqualTimeOffset(date, adBreak.timeOffset, lookupDate),
  );

  if (!adBreak) {
    return;
  }

  const adMedias = await getAdMediasFromVast(adBreak);

  for (const adMedia of adMedias) {
    const url = getMasterUrl(adMedia.assetId);
    assets.push({
      URI: url,
      DURATION: await fetchPlaylistDuration(url),
      "MIX-TYPE": "ad",
    });
  }
}

async function formatInterstitials(
  assets: InterstitialAsset[],
  interstitials: SessionInterstitial[],
  baseDate: string,
  lookupDate: string,
) {
  const date = DateTime.fromISO(baseDate);

  const filteredInterstitials = interstitials.filter((interstitial) =>
    isEqualTimeOffset(date, interstitial.timeOffset, lookupDate),
  );

  for (const interstitial of filteredInterstitials) {
    const url = getMasterUrl(interstitial.uri);
    assets.push({
      URI: url,
      DURATION: await fetchPlaylistDuration(url),
      "MIX-TYPE": interstitial.type,
    });
  }
}

function isEqualTimeOffset(
  baseDate: DateTime,
  timeOffset: number,
  lookupDate: string,
) {
  return baseDate.plus({ seconds: timeOffset }).toISO() === lookupDate;
}

export function needsProgramDateTime(session: Session) {
  if (session.interstitials?.length) {
    return true;
  }
  if (session.vmap) {
    return true;
  }
  return false;
}
