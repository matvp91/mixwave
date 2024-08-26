const {MasterPlaylist, Variant, Rendition} = require('../../../types');

const renditions = {
  aud1: [
    new Rendition({
      type: 'AUDIO',
      uri: 'a1/prog_index.m3u8',
      groupId: 'aud1',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      channels: '2'
    })
  ],
  aud2: [
    new Rendition({
      type: 'AUDIO',
      uri: 'a2/prog_index.m3u8',
      groupId: 'aud2',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      channels: '6'
    })
  ],
  aud3: [
    new Rendition({
      type: 'AUDIO',
      uri: 'a3/prog_index.m3u8',
      groupId: 'aud3',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      channels: '6'
    })
  ],
  cc1: [
    new Rendition({
      type: 'CLOSED-CAPTIONS',
      groupId: 'cc1',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      instreamId: 'CC1'
    })
  ],
  sub1: [
    new Rendition({
      type: 'SUBTITLES',
      uri: 's1/en/prog_index.m3u8',
      groupId: 'sub1',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      forced: false
    })
  ]
};

const playlist = new MasterPlaylist({
  version: 6,
  independentSegments: true,
  variants: createVariants()
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: 'v5/prog_index.m3u8',
    bandwidth: 2227464,
    averageBandwidth: 2218327,
    codecs: 'avc1.640020,mp4a.40.2',
    resolution: {width: 960, height: 540},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v9/prog_index.m3u8',
    bandwidth: 8178040,
    averageBandwidth: 8144656,
    codecs: 'avc1.64002a,mp4a.40.2',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v8/prog_index.m3u8',
    bandwidth: 6453202,
    averageBandwidth: 6307144,
    codecs: 'avc1.64002a,mp4a.40.2',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v7/prog_index.m3u8',
    bandwidth: 5054232,
    averageBandwidth: 4775338,
    codecs: 'avc1.64002a,mp4a.40.2',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v6/prog_index.m3u8',
    bandwidth: 3289288,
    averageBandwidth: 3240596,
    codecs: 'avc1.640020,mp4a.40.2',
    resolution: {width: 1280, height: 720},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v4/prog_index.m3u8',
    bandwidth: 1296989,
    averageBandwidth: 1292926,
    codecs: 'avc1.64001e,mp4a.40.2',
    resolution: {width: 768, height: 432},
    frameRate: 30.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v3/prog_index.m3u8',
    bandwidth: 922242,
    averageBandwidth: 914722,
    codecs: 'avc1.64001e,mp4a.40.2',
    resolution: {width: 640, height: 360},
    frameRate: 30.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v2/prog_index.m3u8',
    bandwidth: 553010,
    averageBandwidth: 541239,
    codecs: 'avc1.640015,mp4a.40.2',
    resolution: {width: 480, height: 270},
    frameRate: 30.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v5/prog_index.m3u8',
    bandwidth: 2448841,
    averageBandwidth: 2439704,
    codecs: 'avc1.640020,ac-3',
    resolution: {width: 960, height: 540},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v9/prog_index.m3u8',
    bandwidth: 8399417,
    averageBandwidth: 8366033,
    codecs: 'avc1.64002a,ac-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v8/prog_index.m3u8',
    bandwidth: 6674579,
    averageBandwidth: 6528521,
    codecs: 'avc1.64002a,ac-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v7/prog_index.m3u8',
    bandwidth: 5275609,
    averageBandwidth: 4996715,
    codecs: 'avc1.64002a,ac-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v6/prog_index.m3u8',
    bandwidth: 3510665,
    averageBandwidth: 3461973,
    codecs: 'avc1.640020,ac-3',
    resolution: {width: 1280, height: 720},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v4/prog_index.m3u8',
    bandwidth: 1518366,
    averageBandwidth: 1514303,
    codecs: 'avc1.64001e,ac-3',
    resolution: {width: 768, height: 432},
    frameRate: 30.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v3/prog_index.m3u8',
    bandwidth: 1143619,
    averageBandwidth: 1136099,
    codecs: 'avc1.64001e,ac-3',
    resolution: {width: 640, height: 360},
    frameRate: 30.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v2/prog_index.m3u8',
    bandwidth: 774387,
    averageBandwidth: 762616,
    codecs: 'avc1.640015,ac-3',
    resolution: {width: 480, height: 270},
    frameRate: 30.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v5/prog_index.m3u8',
    bandwidth: 2256841,
    averageBandwidth: 2247704,
    codecs: 'avc1.640020,ec-3',
    resolution: {width: 960, height: 540},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v9/prog_index.m3u8',
    bandwidth: 8207417,
    averageBandwidth: 8174033,
    codecs: 'avc1.64002a,ec-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v8/prog_index.m3u8',
    bandwidth: 6482579,
    averageBandwidth: 6336521,
    codecs: 'avc1.64002a,ec-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v7/prog_index.m3u8',
    bandwidth: 5083609,
    averageBandwidth: 4804715,
    codecs: 'avc1.64002a,ec-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v6/prog_index.m3u8',
    bandwidth: 3318665,
    averageBandwidth: 3269973,
    codecs: 'avc1.640020,ec-3',
    resolution: {width: 1280, height: 720},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v4/prog_index.m3u8',
    bandwidth: 1326366,
    averageBandwidth: 1322303,
    codecs: 'avc1.64001e,ec-3',
    resolution: {width: 768, height: 432},
    frameRate: 30.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v3/prog_index.m3u8',
    bandwidth: 951619,
    averageBandwidth: 944099,
    codecs: 'avc1.64001e,ec-3',
    resolution: {width: 640, height: 360},
    frameRate: 30.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v2/prog_index.m3u8',
    bandwidth: 582387,
    averageBandwidth: 570616,
    codecs: 'avc1.640015,ec-3',
    resolution: {width: 480, height: 270},
    frameRate: 30.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1
  }));
  variants.push(new Variant({
    uri: 'v7/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 186522,
    averageBandwidth: 182077,
    codecs: 'avc1.64002a',
    resolution: {width: 1920, height: 1080}
  }));
  variants.push(new Variant({
    uri: 'v6/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 133856,
    averageBandwidth: 129936,
    codecs: 'avc1.640020',
    resolution: {width: 1280, height: 720}
  }));
  variants.push(new Variant({
    uri: 'v5/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 98136,
    averageBandwidth: 94286,
    codecs: 'avc1.640020',
    resolution: {width: 960, height: 540}
  }));
  variants.push(new Variant({
    uri: 'v4/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 76704,
    averageBandwidth: 74767,
    codecs: 'avc1.64001e',
    resolution: {width: 768, height: 432}
  }));
  variants.push(new Variant({
    uri: 'v3/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 64078,
    averageBandwidth: 62251,
    codecs: 'avc1.64001e',
    resolution: {width: 640, height: 360}
  }));
  variants.push(new Variant({
    uri: 'v2/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 38728,
    averageBandwidth: 37866,
    codecs: 'avc1.640015',
    resolution: {width: 480, height: 270}
  }));
  return variants;
}

module.exports = playlist;
