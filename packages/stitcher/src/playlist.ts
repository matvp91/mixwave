import * as hlsParser from "../extern/hls-parser/index.js";
import parseFilepath from "parse-filepath";
import { env } from "./env.js";
import { MasterPlaylist, MediaPlaylist } from "../extern/hls-parser/types.js";
import createError from "@fastify/error";
import type { Session, Interstitial } from "./types.js";

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

async function fetchPlaylist<T>(url: string) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return hlsParser.parse(text) as T;
  } catch (error) {
    throw new PlaylistUnavailableError(url);
  }
}

export async function formatMasterPlaylist(session: Session) {
  const url = `${env.S3_PUBLIC_URL}/package/${session.assetId}/hls/master.m3u8`;

  const master = await fetchPlaylist<MasterPlaylist>(url);

  master.variants = master.variants.filter((variant) => {
    if (!variant.resolution) {
      return true;
    }
    return variant.resolution.height <= session.maxResolution;
  });

  if (!master.variants.length) {
    throw new NoVariantsError();
  }

  return hlsParser.stringify(master);
}

export async function formatMediaPlaylist(session: Session, path: string) {
  const url = `${env.S3_PUBLIC_URL}/package/${session.assetId}/hls/${path}/playlist.m3u8`;

  const media = await fetchPlaylist<MediaPlaylist>(url);

  rewriteSegmentUrls(media, url);

  addInterstitials(media, session.interstitials, session.id);

  return hlsParser.stringify(media);
}

export async function formatAssetList(session: Session, timeOffset: number) {
  const interstitials = session.interstitials.filter(
    (ad) => ad.timeOffset === timeOffset,
  );

  const assets = await Promise.all(
    interstitials.map(async (interstitial) => {
      const uri = `${env.S3_PUBLIC_URL}/package/${interstitial.assetId}/hls/master.m3u8`;
      return {
        URI: uri,
        DURATION: await getDuration(uri),
      };
    }),
  );

  return { ASSETS: assets };
}

async function getDuration(url: string) {
  const filePath = parseFilepath(url);

  const master = await fetchPlaylist<MasterPlaylist>(url);

  const media = await fetchPlaylist<MediaPlaylist>(
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

  const now = Date.now();

  media.segments[0].programDateTime = new Date(now);

  interstitials
    .reduce<number[]>((acc, interstitial) => {
      if (!acc.includes(interstitial.timeOffset)) {
        acc.push(interstitial.timeOffset);
      }
      return acc;
    }, [])
    .forEach((timeOffset) => {
      media.interstitials.push(
        new hlsParser.types.Interstitial({
          id: `${timeOffset}`,
          startDate: new Date(now + timeOffset * 1000),
          list: `/session/${sessionId}/asset-list.json?timeOffset=${timeOffset}`,
        }),
      );
    });
}

function rewriteSegmentUrls(media: MediaPlaylist, url: string) {
  const filePath = parseFilepath(url);

  for (const segment of media.segments) {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = `${filePath.dir}/init.mp4`;
    }

    segment.uri = `${filePath.dir}/${segment.uri}`;
  }
}
