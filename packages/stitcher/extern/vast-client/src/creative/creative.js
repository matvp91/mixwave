export function createCreative(creativeAttributes = {}) {
  return {
    id: creativeAttributes.id || null,
    adId: creativeAttributes.adId || null,
    sequence: creativeAttributes.sequence || null,
    apiFramework: creativeAttributes.apiFramework || null,
    universalAdIds: [],
    creativeExtensions: [],
  };
}
