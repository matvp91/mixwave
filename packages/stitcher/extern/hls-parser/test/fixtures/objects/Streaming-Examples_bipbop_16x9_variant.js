const {MasterPlaylist, Variant, Rendition} = require('../../../types');

const renditions = {
  bipbop_audio: [
    new Rendition({
      type: 'AUDIO',
      groupId: 'bipbop_audio',
      language: 'eng',
      name: 'BipBop Audio 1',
      autoselect: true,
      isDefault: true
    }),
    new Rendition({
      type: 'AUDIO',
      uri: 'alternate_audio_aac/prog_index.m3u8',
      groupId: 'bipbop_audio',
      language: 'eng',
      name: 'BipBop Audio 2',
      autoselect: false,
      isDefault: false
    })
  ],
  subs: [
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/eng/prog_index.m3u8',
      groupId: 'subs',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      forced: false,
      characteristics: 'public.accessibility.transcribes-spoken-dialog, public.accessibility.describes-music-and-sound'
    }),
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/eng_forced/prog_index.m3u8',
      groupId: 'subs',
      language: 'en',
      name: 'English (Forced)',
      autoselect: false,
      isDefault: false,
      forced: true
    }),
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/fra/prog_index.m3u8',
      groupId: 'subs',
      language: 'fr',
      name: 'Français',
      autoselect: true,
      isDefault: false,
      forced: false,
      characteristics: 'public.accessibility.transcribes-spoken-dialog, public.accessibility.describes-music-and-sound'
    }),
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/fra_forced/prog_index.m3u8',
      groupId: 'subs',
      language: 'fr',
      name: 'Français (Forced)',
      autoselect: false,
      isDefault: false,
      forced: true
    }),
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/spa/prog_index.m3u8',
      groupId: 'subs',
      language: 'es',
      name: 'Español',
      autoselect: true,
      isDefault: false,
      forced: false,
      characteristics: 'public.accessibility.transcribes-spoken-dialog, public.accessibility.describes-music-and-sound'
    }),
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/spa_forced/prog_index.m3u8',
      groupId: 'subs',
      language: 'es',
      name: 'Español (Forced)',
      autoselect: false,
      isDefault: false,
      forced: true
    }),
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/jpn/prog_index.m3u8',
      groupId: 'subs',
      language: 'ja',
      name: '日本語',
      autoselect: true,
      isDefault: false,
      forced: false,
      characteristics: 'public.accessibility.transcribes-spoken-dialog, public.accessibility.describes-music-and-sound'
    }),
    new Rendition({
      type: 'SUBTITLES',
      uri: 'subtitles/jpn_forced/prog_index.m3u8',
      groupId: 'subs',
      language: 'ja',
      name: '日本語 (Forced)',
      autoselect: false,
      isDefault: false,
      forced: true
    })
  ]
};

const playlist = new MasterPlaylist({
  variants: createVariants()
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: 'gear1/prog_index.m3u8',
    bandwidth: 263851,
    codecs: 'mp4a.40.2, avc1.4d400d',
    resolution: {width: 416, height: 234},
    audio: renditions.bipbop_audio,
    subtitles: renditions.subs
  }));
  variants.push(new Variant({
    uri: 'gear1/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 28451,
    codecs: 'avc1.4d400d'
  }));
  variants.push(new Variant({
    uri: 'gear2/prog_index.m3u8',
    bandwidth: 577610,
    codecs: 'mp4a.40.2, avc1.4d401e',
    resolution: {width: 640, height: 360},
    audio: renditions.bipbop_audio,
    subtitles: renditions.subs
  }));
  variants.push(new Variant({
    uri: 'gear2/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 181534,
    codecs: 'avc1.4d401e'
  }));
  variants.push(new Variant({
    uri: 'gear3/prog_index.m3u8',
    bandwidth: 915905,
    codecs: 'mp4a.40.2, avc1.4d401f',
    resolution: {width: 960, height: 540},
    audio: renditions.bipbop_audio,
    subtitles: renditions.subs
  }));
  variants.push(new Variant({
    uri: 'gear3/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 297056,
    codecs: 'avc1.4d401f'
  }));
  variants.push(new Variant({
    uri: 'gear4/prog_index.m3u8',
    bandwidth: 1030138,
    codecs: 'mp4a.40.2, avc1.4d401f',
    resolution: {width: 1280, height: 720},
    audio: renditions.bipbop_audio,
    subtitles: renditions.subs
  }));
  variants.push(new Variant({
    uri: 'gear4/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 339492,
    codecs: 'avc1.4d401f'
  }));
  variants.push(new Variant({
    uri: 'gear5/prog_index.m3u8',
    bandwidth: 1924009,
    codecs: 'mp4a.40.2, avc1.4d401f',
    resolution: {width: 1920, height: 1080},
    audio: renditions.bipbop_audio,
    subtitles: renditions.subs
  }));
  variants.push(new Variant({
    uri: 'gear5/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 669554,
    codecs: 'avc1.4d401f'
  }));
  variants.push(new Variant({
    uri: 'gear0/prog_index.m3u8',
    bandwidth: 41457,
    codecs: 'mp4a.40.2',
    audio: renditions.bipbop_audio,
    subtitles: renditions.subs
  }));
  return variants;
}

module.exports = playlist;
