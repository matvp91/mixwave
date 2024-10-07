import { DateTime } from "luxon";
import { env } from "./env.js";
import { getMasterUrl } from "./url.js";
import { getAdMediasFromVast } from "./vast.js";
import { fetchPlaylistDuration } from "./presentation/utils.js";
import { VmapResponse } from "./vmap.js";
import type { DateRange } from "./parser/types.js";
import type {
  Session,
  SessionInterstitialType,
  SessionInterstitial,
} from "./types.js";

type InterstitialAsset = {
  URI: string;
  DURATION: number;
  "MIX-TYPE": Required<SessionInterstitial["type"]>;
};

export function formatDateRanges(session: Session) {
  const group: Record<string, SessionInterstitialType[]> = {};

  if (session.vmapResponse) {
    for (const adBreak of session.vmapResponse.adBreaks) {
      groupTimeOffset(group, session.startDate, adBreak.timeOffset, "ad");
    }
  }
  if (session.interstitials) {
    for (const interstitial of session.interstitials) {
      groupTimeOffset(
        group,
        session.startDate,
        interstitial.timeOffset,
        interstitial.type,
      );
    }
  }

  return Object.entries(group).map<DateRange>(([startDate, types], index) => {
    const assetListUrl = `${env.PUBLIC_STITCHER_ENDPOINT}/session/${session.id}/asset-list.json?startDate=${encodeURIComponent(startDate)}`;

    const clientAttributes = {
      RESTRICT: "SKIP,JUMP",
      "RESUME-OFFSET": 0,
      "ASSET-LIST": assetListUrl,
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
  startDate: DateTime,
  timeOffset: number,
  type?: SessionInterstitialType,
) {
  const key = startDate.plus({ seconds: timeOffset }).toISO();
  if (!key) {
    return;
  }
  if (!group[key]) {
    group[key] = [];
  }
  if (type) {
    group[key].push(type);
  }
}

export async function getAssets(session: Session, lookupDate: DateTime) {
  const assets: InterstitialAsset[] = [];

  if (session.vmapResponse) {
    await formatAdBreaks(
      assets,
      session.vmapResponse,
      session.startDate,
      lookupDate,
    );
  }

  if (session.interstitials) {
    await formatInterstitials(
      assets,
      session.interstitials,
      session.startDate,
      lookupDate,
    );
  }

  return assets;
}

async function formatAdBreaks(
  assets: InterstitialAsset[],
  vmapResponse: VmapResponse,
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  const adBreak = vmapResponse.adBreaks.find((adBreak) =>
    isEqualTimeOffset(baseDate, adBreak.timeOffset, lookupDate),
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
  baseDate: DateTime,
  lookupDate: DateTime,
) {
  const filteredInterstitials = interstitials.filter((interstitial) =>
    isEqualTimeOffset(baseDate, interstitial.timeOffset, lookupDate),
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
  lookupDate: DateTime,
) {
  return baseDate.plus({ seconds: timeOffset }).toISO() === lookupDate.toISO();
}
