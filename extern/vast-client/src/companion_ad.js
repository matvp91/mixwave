export function createCompanionAd(creativeAttributes = {}) {
  return {
    id: creativeAttributes.id || null,
    adType: 'companionAd',
    width: creativeAttributes.width || 0,
    height: creativeAttributes.height || 0,
    assetWidth: creativeAttributes.assetWidth || null,
    assetHeight: creativeAttributes.assetHeight || null,
    expandedWidth: creativeAttributes.expandedWidth || null,
    expandedHeight: creativeAttributes.expandedHeight || null,
    apiFramework: creativeAttributes.apiFramework || null,
    adSlotId: creativeAttributes.adSlotId || null,
    pxratio: creativeAttributes.pxratio || '1',
    renderingMode: creativeAttributes.renderingMode || 'default',
    staticResources: [],
    htmlResources: [],
    iframeResources: [],
    adParameters: null,
    altText: null,
    companionClickThroughURLTemplate: null,
    companionClickTrackingURLTemplates: [],
    trackingEvents: {},
  };
}

export function isCompanionAd(ad) {
  return ad.adType === 'companionAd';
}
