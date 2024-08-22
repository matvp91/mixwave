export function createMediaFile() {
  return {
    id: null,
    fileURL: null,
    fileSize: 0,
    deliveryType: 'progressive',
    mimeType: null,
    mediaType: null,
    codec: null,
    bitrate: 0,
    minBitrate: 0,
    maxBitrate: 0,
    width: 0,
    height: 0,
    apiFramework: null, // @deprecated in VAST 4.1. <InteractiveCreativeFile> should be used instead.
    scalable: null,
    maintainAspectRatio: null,
  };
}
