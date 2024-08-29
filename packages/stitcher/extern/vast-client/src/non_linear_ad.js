export function createNonLinearAd() {
  return {
    id: null,
    width: 0,
    height: 0,
    expandedWidth: 0,
    expandedHeight: 0,
    scalable: true,
    maintainAspectRatio: true,
    minSuggestedDuration: 0,
    apiFramework: 'static',
    adType: 'nonLinearAd',
    type: null,
    staticResource: null,
    htmlResource: null,
    iframeResource: null,
    nonlinearClickThroughURLTemplate: null,
    nonlinearClickTrackingURLTemplates: [],
    adParameters: null,
  };
}

export function isNonLinearAd(ad) {
  return ad.adType === 'nonLinearAd';
}
