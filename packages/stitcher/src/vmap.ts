import VMAP from "@dailymotion/vmap";
import VAST from "@dailymotion/vast-client";
import { DOMParser } from "xmldom";
import timeFormat from "hh-mm-ss";
import { addTranscodeJob } from "@mixwave/artisan/producer";
import getUuidByString from "uuid-by-string";
import { env } from "./env.js";
import type { Ad } from "./types.js";

async function fetchXml(url: string) {
  const response = await fetch(url);
  const text = await response.text();

  const parser = new DOMParser();
  return parser.parseFromString(text, "text/xml");
}

export async function resolveVmap(url: string) {
  const vastParser = new VAST.VASTParser();

  const vmap = new VMAP(await fetchXml(url));

  const ads: Ad[] = [];

  for (const vmapAdBreak of vmap.adBreaks) {
    const { uri } = vmapAdBreak.adSource.adTagURI;
    const vast = await vastParser.parseVAST(await fetchXml(uri));

    let offset: number;
    if (vmapAdBreak.timeOffset === "end") {
      offset = -1;
    } else if (vmapAdBreak.timeOffset === "start") {
      offset = 0;
    } else {
      offset = timeFormat.toS(vmapAdBreak.timeOffset);
    }

    for (const vastAd of vast.ads) {
      if (!vastAd.id) {
        continue;
      }

      const mediaFile = getMediaFile(vastAd);
      if (!mediaFile?.fileURL) {
        continue;
      }

      const prefix =
        typeof vastAd.system === "string"
          ? vastAd.system
          : vastAd.system?.value;
      if (!prefix) {
        continue;
      }

      const ad: Ad = {
        id: `ad_${getUuidByString(prefix + vastAd.id)}`,
        offset,
        url: mediaFile.fileURL,
      };

      ads.push(ad);
    }
  }

  const finalAds: { offset: number; id: string }[] = [];
  for (const ad of ads) {
    if (await isPackaged(ad.id)) {
      finalAds.push({
        id: ad.id,
        offset: ad.offset,
      });
      continue;
    }

    await addTranscodeJob({
      assetId: ad.id,
      package: true,
      segmentSize: 4,
      inputs: [
        {
          path: ad.url,
          type: "video",
        },
        {
          path: ad.url,
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

  return finalAds;
}

function getMediaFile(ad: VAST.VastAd) {
  type LinearCreative = VAST.VastCreativeLinear | undefined;

  const creative = ad.creatives.find(
    (creative) => creative.type === "linear",
  ) as LinearCreative;

  if (!creative) {
    return null;
  }

  const mediaFiles = creative.mediaFiles
    .filter((mediaFile) => mediaFile.mimeType === "video/mp4")
    .sort((a, b) => b.height - a.height);

  if (!mediaFiles.length) {
    return null;
  }

  return mediaFiles[0];
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
