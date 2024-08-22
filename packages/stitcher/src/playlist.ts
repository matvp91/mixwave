import { parse, stringify } from "../extern/hls-parser/index.js";
import parseFilepath from "parse-filepath";
import { Interstitial } from "../extern/hls-parser/types.js";
import { getSessionAds } from "./session.js";
import { env } from "./env.js";
import { MasterPlaylist, MediaPlaylist } from "../extern/hls-parser/types.js";

async function fetchPlaylist<T>(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parse(text) as T;
}

export async function formatMasterPlaylist(url: string) {
  const master = await fetchPlaylist<MasterPlaylist>(url);

  return stringify(master);
}

export async function formatMediaPlaylist(url: string, sessionId: string) {
  const media = await fetchPlaylist<MediaPlaylist>(url);

  const filePath = parseFilepath(url);

  for (const segment of media.segments) {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = `${filePath.dir}/init.mp4`;
    }

    segment.uri = `${filePath.dir}/${segment.uri}`;
  }

  const ads = await getSessionAds(sessionId);

  const adsMap =
    ads?.reduce<Record<number, string[]>>((acc, ad) => {
      if (!acc[ad.offset]) {
        acc[ad.offset] = [];
      }
      acc[ad.offset].push(ad.id);
      return acc;
    }, {}) ?? {};

  const now = Date.now();

  media.segments[0].programDateTime = new Date(now);

  Object.keys(adsMap).forEach((offsetStr) => {
    const offset = parseInt(offsetStr);

    if (offset === -1) {
      // Skip postrolls.
      return;
    }

    media.interstitials.push(
      new Interstitial({
        id: `${offset}`,
        startDate: new Date(now + offset * 1000),
        list: `/interstitials/${sessionId}/list.json?offset=${offset}`,
      }),
    );
  });

  return stringify(media);
}

export async function formatInterstitialsJson(
  sessionId: string,
  offset: number,
) {
  const ads = await getSessionAds(sessionId);

  const filteredAds = ads?.filter((ad) => ad.offset === offset) ?? [];

  const ASSETS: any[] = [];

  for (const ad of filteredAds) {
    const uri = `${env.S3_PUBLIC_URL}/package/${ad.id}/hls/master.m3u8`;
    const duration = await getDuration(uri);
    ASSETS.push({
      URI: uri,
      DURATION: duration,
    });
  }

  return { ASSETS };
}

async function getDuration(url: string) {
  const master = await fetchPlaylist<MasterPlaylist>(url);
  const filePath = parseFilepath(url);
  const media = await fetchPlaylist<MediaPlaylist>(
    `${filePath.dir}/${master.variants[0].uri}`,
  );
  return media.segments.reduce((acc, segment) => {
    acc += segment.duration;
    return acc;
  }, 0);
}
