import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import timeFormat from "hh-mm-ss";
import { addTranscodeJob } from "@mixwave/artisan/producer";
import getUuidByString from "uuid-by-string";
import { env } from "./env.js";
import * as VAST from "../extern/vast-client/index.js";
import type { Ad } from "./types.js";

type AdMedia = {
  assetId: string;
  url: string;
};

const vastClient = new VAST.VASTClient();

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
  const response = await vastClient.get(url);
  return await formatVastResponse(response);
}

async function resolveVastByXml(text: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");
  console.log(doc);
  // @ts-ignore
  const response = await vastClient.parseVAST(doc);
  return await formatVastResponse(response);
}

async function formatVastResponse(response: VAST.VastResponse) {
  return response.ads.reduce<AdMedia[]>((acc, ad) => {
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

function formatTimeOffset(value: string | null) {
  if (value === null) return null;
  if (value === "start") return 0;
  if (value === "end") return null;
  return timeFormat.toS(value);
}

const xmlSerializer = new XMLSerializer();

type AdBreak = {
  timeOffset: number;
  vastUrl?: string;
  vastData?: string;
};

export async function resolveVmap2(url: string) {
  const xml = await fetchXml(url);

  if (xml.documentElement.localName !== "VMAP") {
    throw new Error("Not a vmap");
  }

  const adBreaks: AdBreak[] = [];

  for (const nodeKey in xml.documentElement.childNodes) {
    const node = xml.documentElement.childNodes[nodeKey] as Element;
    if (node.localName === "AdBreak") {
      const timeOffset = formatTimeOffset(node.getAttribute("timeOffset"));
      if (timeOffset === null) {
        continue;
      }

      let vastUrl: string | undefined;
      let vastData: string | undefined;

      for (const node2Key in node.childNodes) {
        const node2 = node.childNodes[node2Key] as Element;

        if (node2.localName === "AdSource") {
          for (const node3Key in node2.childNodes) {
            const node3 = node2.childNodes[node3Key] as Element;

            if (node3.localName === "AdTagURI") {
              vastUrl = node2.textContent?.trim();
            }

            if (node3.localName === "VASTAdData") {
              vastData = xmlSerializer.serializeToString(
                node3.firstChild as Element,
              );
            }
          }
        }
      }

      adBreaks.push({
        timeOffset,
        vastUrl,
        vastData,
      });
    }
  }

  return await resolveVmap(adBreaks);
}

async function resolveVmap(adBreaks: AdBreak[]) {
  const ads: Ad[] = [];
  for (const adBreak of adBreaks) {
    let adMedias: AdMedia[] = [];
    if (adBreak.vastUrl) {
      adMedias = await resolveVastByUrl(adBreak.vastUrl);
    }
    if (adBreak.vastData) {
      adMedias = await resolveVastByXml(adBreak.vastData);
    }

    for (const adMedia of adMedias) {
      if (await isPackaged(adMedia.assetId)) {
        ads.push({
          timeOffset: adBreak.timeOffset,
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
