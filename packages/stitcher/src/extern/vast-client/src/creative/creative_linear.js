import { createCreative } from "./creative.js";

export function createCreativeLinear(creativeAttributes = {}) {
  const { id, adId, sequence, apiFramework } =
    createCreative(creativeAttributes);
  return {
    id,
    adId,
    sequence,
    apiFramework,
    type: "linear",
    duration: 0,
    skipDelay: null,
    mediaFiles: [],
    mezzanine: null,
    interactiveCreativeFile: null,
    closedCaptionFiles: [],
    videoClickThroughURLTemplate: null,
    videoClickTrackingURLTemplates: [],
    videoCustomClickURLTemplates: [],
    adParameters: null,
    icons: [],
    trackingEvents: {},
  };
}

export function isCreativeLinear(ad) {
  return ad.type === "linear";
}
