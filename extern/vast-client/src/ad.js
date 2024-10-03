export function createAd(adAttributes = {}) {
  return {
    id: adAttributes.id || null,
    sequence: adAttributes.sequence || null,
    adType: adAttributes.adType || null,
    adServingId: null,
    categories: [],
    expires: null,
    viewableImpression: [],
    system: null,
    title: null,
    description: null,
    advertiser: null,
    pricing: null,
    survey: null, // @deprecated in VAST 4.1
    errorURLTemplates: [],
    impressionURLTemplates: [],
    creatives: [],
    extensions: [],
    adVerifications: [],
    blockedAdCategories: [],
    followAdditionalWrappers: true,
    allowMultipleAds: false,
    fallbackOnNoAd: null,
  };
}
