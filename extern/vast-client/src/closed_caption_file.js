export function createClosedCaptionFile(closedCaptionAttributes = {}) {
  return {
    type: closedCaptionAttributes.type || null,
    language: closedCaptionAttributes.language || null,
    fileURL: null,
  };
}
