import {
  createDateRangeInterstitial,
  parseMasterPlaylist,
  parseMediaPlaylist,
  stringify,
} from "./parser/index.js";
import parseFilepath from "parse-filepath";
import createError from "@fastify/error";
import { filterVariantsByString } from "./helpers.js";
import { formatUri, withPath } from "./uri.js";
import { DateTime } from "luxon";
import type { Session, Interstitial, InterstitialType } from "./types.js";
import type { MediaPlaylist } from "./parser/index.js";

const PlaylistUnavailableError = createError<[string]>(
  "PLAYLIST_UNAVAILABLE",
  "%s is unavailable.",
  404,
);

const NoVariantsError = createError(
  "NO_VARIANTS",
  "The playlist does not contain variants, " +
    "this is possibly caused by variant filtering.",
  400,
);

const NoInterstitialsError = createError(
  "NO_INTERSTITIALS",
  "The playlist does not contain interstitials",
);

const InvalidFilter = createError("INVALID_FILTER", "Invalid filter");

export async function fetchMasterPlaylist(url: string) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return parseMasterPlaylist(text);
  } catch {
    throw new PlaylistUnavailableError(url);
  }
}

export async function fetchMediaPlaylist(url: string) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return parseMediaPlaylist(text);
  } catch {
    throw new PlaylistUnavailableError(url);
  }
}

export async function formatMasterPlaylist(session: Session) {
  const format = formatUri(session.uri);
  const url = withPath(format.base, format.file);

  const master = await fetchMasterPlaylist(url);

  if (session.resolution) {
    try {
      master.variants = filterVariantsByString(
        master.variants,
        session.resolution,
      );
    } catch {
      throw new InvalidFilter();
    }
  }

  if (!master.variants.length) {
    throw new NoVariantsError();
  }

  return stringify(master);
}

export async function formatMediaPlaylist(session: Session, path: string) {
  const format = formatUri(session.uri);
  const url = withPath(format.base, path);

  const media = await fetchMediaPlaylist(url);

  const mediaFormat = formatUri(url);
  rewriteSegmentUrls(media, mediaFormat.base);

  if (session.interstitials) {
    addInterstitials(media, session.interstitials, session.id);
  }

  return stringify(media);
}

export async function formatAssetList(session: Session, timeOffset: number) {
  if (!session.interstitials) {
    throw new NoInterstitialsError();
  }

  const interstitials = session.interstitials.filter(
    (ad) => ad.timeOffset === timeOffset,
  );

  const assets = await Promise.all(
    interstitials.map(async (interstitial) => {
      const format = formatUri(interstitial.uri);
      const url = withPath(format.base, format.file);

      return {
        URI: url,
        DURATION: await getDuration(url),
        "MIX-TYPE": interstitial.type,
      };
    }),
  );

  return { ASSETS: assets };
}

async function getDuration(url: string) {
  const filePath = parseFilepath(url);

  const master = await fetchMasterPlaylist(url);

  const media = await fetchMediaPlaylist(
    `${filePath.dir}/${master.variants[0].uri}`,
  );

  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}

function addInterstitials(
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

  interstitials
    .reduce<TypedInterstitial[]>((acc, interstitial) => {
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
    }, [])
    .forEach((item) => {
      const attrs = {
        "MIX-TYPES": item.types.join(","),
      };

      media.dateRanges.push(
        createDateRangeInterstitial({
          base: now,
          timeOffset: item.timeOffset,
          list: `/session/${sessionId}/asset-list.json?timeOffset=${item.timeOffset}`,
          attrs,
        }),
      );
    });
}

function rewriteSegmentUrls(media: MediaPlaylist, base: string) {
  for (const segment of media.segments) {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = withPath(base, segment.map.uri);
    }
    segment.uri = withPath(base, segment.uri);
  }
}

type TypedInterstitial = {
  timeOffset: number;
  types: InterstitialType[];
};
