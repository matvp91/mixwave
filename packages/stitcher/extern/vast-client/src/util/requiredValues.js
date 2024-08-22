export const requiredValues = {
  Wrapper: {
    subElements: ['VASTAdTagURI', 'Impression'],
  },
  BlockedAdCategories: {
    attributes: ['authority'],
  },
  InLine: {
    subElements: [
      'AdSystem',
      'AdTitle',
      'Impression',
      'AdServingId',
      'Creatives',
    ],
  },
  Category: {
    attributes: ['authority'],
  },
  Pricing: {
    attributes: ['model', 'currency'],
  },
  Verification: {
    oneOfinLineResources: ['JavaScriptResource', 'ExecutableResource'],
    attributes: ['vendor'],
  },
  UniversalAdId: {
    attributes: ['idRegistry'],
  },
  JavaScriptResource: {
    attributes: ['apiFramework', 'browserOptional'],
  },
  ExecutableResource: {
    attributes: ['apiFramework', 'type'],
  },
  Tracking: {
    attributes: ['event'],
  },
  Creatives: {
    subElements: ['Creative'],
  },
  Creative: {
    subElements: ['UniversalAdId'],
  },
  Linear: {
    subElements: ['MediaFiles', 'Duration'],
  },
  MediaFiles: {
    subElements: ['MediaFile'],
  },
  MediaFile: {
    attributes: ['delivery', 'type', 'width', 'height'],
  },
  Mezzanine: {
    attributes: ['delivery', 'type', 'width', 'height'],
  },
  NonLinear: {
    oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
    attributes: ['width', 'height'],
  },
  Companion: {
    oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
    attributes: ['width', 'height'],
  },
  StaticResource: {
    attributes: ['creativeType'],
  },
  Icons: {
    subElements: ['Icon'],
  },
  Icon: {
    oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
  },
};
