import { parse, stringify } from "./extern/hls-parser/index.js";
import parseFilepath from "parse-filepath";
import { Interstitial } from "./extern/hls-parser/types.js";
import { env } from "./env.js";
import { MasterPlaylist, MediaPlaylist } from "./extern/hls-parser/types.js";
import type { Session } from "./types.js";

async function fetchPlaylist<T>(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parse(text) as T;
}

export async function formatMasterPlaylist(session: Session) {
  const url = `${env.S3_PUBLIC_URL}/package/${session.assetId}/hls/master.m3u8`;

  const master = await fetchPlaylist<MasterPlaylist>(url);

  return stringify(master);
}

export async function formatMediaPlaylist(session: Session, path: string) {
  const url = `${env.S3_PUBLIC_URL}/package/${session.assetId}/hls/${path}/playlist.m3u8`;

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

  session.interstitials
    .reduce<number[]>((acc, interstitial) => {
      if (!acc.includes(interstitial.timeOffset)) {
        acc.push(interstitial.timeOffset);
      }
      return acc;
    }, [])
    .forEach((timeOffset) => {
      media.interstitials.push(
        new Interstitial({
          id: `${timeOffset}`,
          startDate: new Date(now + timeOffset * 1000),
          list: `/session/${session.id}/asset-list.json?timeOffset=${timeOffset}`,
        }),
      );
    });

  return stringify(media);
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
