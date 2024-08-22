import { parse, stringify } from "../extern/hls-parser/index.js";
import parseFilepath from "parse-filepath";
import { Interstitial } from "../extern/hls-parser/types.js";
import { env } from "./env.js";
import { MasterPlaylist, MediaPlaylist } from "../extern/hls-parser/types.js";
import { Session } from "./types.js";

type InterstitialAsset = {
  URI: string;
  DURATION: number;
};

async function fetchPlaylist<T>(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parse(text) as T;
}

export async function formatMasterPlaylist(url: string) {
  const master = await fetchPlaylist<MasterPlaylist>(url);

  return stringify(master);
}

export async function formatMediaPlaylist(url: string, session: Session) {
  const media = await fetchPlaylist<MediaPlaylist>(url);

  const filePath = parseFilepath(url);

  for (const segment of media.segments) {
    if (segment.map?.uri === "init.mp4") {
      segment.map.uri = `${filePath.dir}/init.mp4`;
    }

    segment.uri = `${filePath.dir}/${segment.uri}`;
  }

  const now = Date.now();

  media.segments[0].programDateTime = new Date(now);

  session.ads
    .reduce<number[]>((acc, ad) => {
      if (!acc.includes(ad.offset)) {
        acc.push(ad.offset);
      }
      return acc;
    }, [])
    .forEach((offset) => {
      media.interstitials.push(
        new Interstitial({
          id: `${offset}`,
          startDate: new Date(now + offset * 1000),
          list: `/interstitials/${session.id}/list.json?offset=${offset}`,
        }),
      );
    });

  return stringify(media);
}

export async function formatInterstitialsJson(
  session: Session,
  offset: number,
) {
  const assets: InterstitialAsset[] = [];

  const ads = session.ads.filter((ad) => ad.offset === offset);

  for (const ad of ads) {
    const uri = `${env.S3_PUBLIC_URL}/package/${ad.assetId}/hls/master.m3u8`;
    assets.push({
      URI: uri,
      DURATION: await getDuration(uri),
    });
  }

  return { ASSETS: assets };
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
