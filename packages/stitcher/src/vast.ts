import { addTranscodeJob } from "@mixwave/artisan/producer";
import { VASTClient } from "../extern/vast-client/index.js";
import { DOMParser } from "@xmldom/xmldom";
import * as uuid from "uuid";
import { NAMESPACE_UUID_AD } from "./const.js";
import type { VmapAdBreak } from "./vmap.js";
import type { Interstitial } from "./types.js";
import type {
  VastResponse,
  VastCreativeLinear,
  VastAd,
} from "../extern/vast-client/index.js";
import { formatUri, isUrlAvailable, withPath } from "./uri.js";

export async function extractInterstitialFromVmapAdbreak(adBreak: VmapAdBreak) {
  const interstitials: Interstitial[] = [];

  const adMedias = await getAdMedias(adBreak);

  for (const adMedia of adMedias) {
    const format = formatUri(`mix://${adMedia.assetId}`);
    const url = withPath(format.base, format.file);

    if (await isUrlAvailable(url)) {
      interstitials.push({
        timeOffset: adBreak.timeOffset,
        uri: url,
        type: "ad",
      });
    } else {
      scheduleForPackage(adMedia);
    }
  }

  return interstitials;
}

async function getAdMedias(adBreak: VmapAdBreak): Promise<AdMedia[]> {
  const vastClient = new VASTClient();

  if (adBreak.vastUrl) {
    const response = await vastClient.get(adBreak.vastUrl);
    return await formatVastResponse(response);
  }

  if (adBreak.vastData) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(adBreak.vastData, "text/xml");

    const response = await vastClient.parseVAST(doc);

    return await formatVastResponse(response);
  }

  return [];
}

function scheduleForPackage(adMedia: AdMedia) {
  addTranscodeJob({
    tag: "ad",
    assetId: adMedia.assetId,
    packageAfter: true,
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
        height: 720,
        bitrate: 4000000,
        framerate: 24,
      },
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

async function formatVastResponse(response: VastResponse) {
  return response.ads.reduce<AdMedia[]>((acc, ad) => {
    const creative = getCreative(ad);
    if (!creative) {
      return acc;
    }

    const mediaFile = getMediaFile(creative);
    if (!mediaFile?.fileURL) {
      return acc;
    }

    const adId = getAdId(creative);

    acc.push({
      assetId: adId,
      url: mediaFile.fileURL,
    });

    return acc;
  }, []);
}

function getMediaFile(creative: VastCreativeLinear) {
  const mediaFiles = creative.mediaFiles
    .filter((mediaFile) => mediaFile.mimeType === "video/mp4")
    .sort((a, b) => b.height - a.height);
  return mediaFiles[0] ?? null;
}

function getCreative(ad: VastAd) {
  for (const creative of ad.creatives) {
    if (creative.type === "linear") {
      return creative as VastCreativeLinear;
    }
  }
  return null;
}

function getAdId(creative: VastCreativeLinear) {
  if (creative.adId && creative.id) {
    // Do not change this, or we'll have a mismatch between the already encoded ad's and the other.
    // See https://iabtechlab.com/guidance-for-uniquely-identifying-creative-asset-ids-in-vast-2/
    const adId = [creative.adId, creative.id].join(".");
    return uuid.v5(adId, NAMESPACE_UUID_AD);
  }

  throw new Error("Failed to generate adId");
}

type AdMedia = {
  assetId: string;
  url: string;
};
