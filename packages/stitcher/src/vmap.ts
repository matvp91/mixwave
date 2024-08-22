import VMAP from "@dailymotion/vmap";
import VAST from "@dailymotion/vast-client";
import { DOMParser, XMLSerializer } from "xmldom";
import timeFormat from "hh-mm-ss";
import { addTranscodeJob } from "@mixwave/artisan/producer";
import getUuidByString from "uuid-by-string";
import { env } from "./env.js";
import type { Ad } from "./types.js";

type AdMedia = {
  assetId: string;
  url: string;
};

const vastParser = new VAST.VASTParser();

async function fetchXml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
    },
  });
  const text = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/xml");
}

async function resolveVastByUrl(url: string) {
  const xml = await fetchXml(url);
  return resolveVast(xml);
}

async function resolveVastByElement(element: Element) {
  const xmlSerializer = new XMLSerializer();
  const str = xmlSerializer.serializeToString(element);
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/xml");
  return resolveVast(doc);
}

async function resolveVast(doc: Document) {
  const vast = await vastParser.parseVAST(doc);

  return vast.ads.reduce<AdMedia[]>((acc, ad) => {
    const creative = getCreative(ad);
    if (!creative) {
      return acc;
    }

    const mediaFile = getMediaFile(creative);
    if (!mediaFile?.fileURL) {
      return acc;
    }

    const idParams = [creative.id];

    if (typeof ad.system === "string") {
      idParams.push(ad.system);
    } else if (ad.system?.value) {
      idParams.push(ad.system.value);
    }

    const uuid = getUuidByString(idParams.join(""));

    acc.push({
      assetId: `ad_${uuid}`,
      url: mediaFile.fileURL,
    });

    return acc;
  }, []);
}

function getOffset(adBreak: VMAP.VMAPAdBreak) {
  if (adBreak.timeOffset === "start") {
    return 0;
  }
  if (adBreak.timeOffset === "end") {
    return -1;
  }
  return timeFormat.toS(adBreak.timeOffset);
}

function scheduleForPackage(adMedia: AdMedia) {
  addTranscodeJob({
    assetId: adMedia.assetId,
    package: true,
    segmentSize: 4,
    inputs: [
      {
        path: adMedia.url,
        type: "video",
      },
      {
        path: adMedia.url,
        type: "audio",
        language: "eng",
      },
    ],
    streams: [
      {
        type: "video",
        codec: "h264",
        height: 480,
        bitrate: 1500000,
        framerate: 24,
      },
      {
        type: "audio",
        codec: "aac",
        bitrate: 128000,
        language: "eng",
      },
    ],
  });
}

export async function resolveVmap(url: string) {
  const xml = await fetchXml(url);
  const vmap = new VMAP(xml);

  const ads: Ad[] = [];
  for (const adBreak of vmap.adBreaks) {
    const offset = getOffset(adBreak);

    // We'll skip postroll ads, they're a bit more complex and require
    // additional thought with HLS interstitials.
    if (offset === -1) {
      continue;
    }

    let adMedias: AdMedia[] = [];
    if (adBreak.adSource.adTagURI) {
      adMedias = await resolveVastByUrl(adBreak.adSource.adTagURI.uri);
    }
    if (adBreak.adSource.vastAdData) {
      adMedias = await resolveVastByElement(adBreak.adSource.vastAdData);
    }

    for (const adMedia of adMedias) {
      if (await isPackaged(adMedia.assetId)) {
        ads.push({
          offset,
          assetId: adMedia.assetId,
        });
      } else {
        scheduleForPackage(adMedia);
      }
    }
  }

  return ads;
}

function getMediaFile(creative: VAST.VastCreativeLinear) {
  const mediaFiles = creative.mediaFiles
    .filter((mediaFile) => mediaFile.mimeType === "video/mp4")
    .sort((a, b) => b.height - a.height);
  return mediaFiles[0] ?? null;
}

function getCreative(ad: VAST.VastAd) {
  for (const creative of ad.creatives) {
    if (creative.type === "linear") {
      return creative as VAST.VastCreativeLinear;
    }
  }
  return null;
}

async function isPackaged(assetId: string) {
  const response = await fetch(
    `${env.S3_PUBLIC_URL}/package/${assetId}/hls/master.m3u8`,
    {
      method: "HEAD",
    },
  );
  return response.ok;
}
