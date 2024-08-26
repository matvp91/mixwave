const {MasterPlaylist, Variant, Rendition} = require('../../../types');

function createRendition(groupId) {
  const renditions = [];
  renditions.push(new Rendition({
    type: 'VIDEO',
    uri: `${groupId}/main/audio-video.m3u8`,
    groupId,
    name: 'Main',
    isDefault: !(groupId === 'mid')
  }));
  renditions.push(new Rendition({
    type: 'VIDEO',
    uri: `${groupId}/centerfield/audio-video.m3u8`,
    groupId,
    name: 'Centerfield',
    isDefault: groupId === 'mid'
  }));
  renditions.push(new Rendition({
    type: 'VIDEO',
    uri: `${groupId}/dugout/audio-video.m3u8`,
    groupId,
    name: 'Dugout',
    isDefault: false
  }));
  return renditions;
}

const playlist = new MasterPlaylist({
  variants: createVariants()
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: 'low/main/audio-video.m3u8',
    bandwidth: 1280000,
    codecs: 'avc1.640029,mp4a.40.2',
    video: createRendition('low'),
    currentRenditions: {video: 0}
  }));
  variants.push(new Variant({
    uri: 'mid/main/audio-video.m3u8',
    bandwidth: 2560000,
    codecs: 'avc1.640029,mp4a.40.2',
    video: createRendition('mid'),
    currentRenditions: {video: 1}
  }));
  variants.push(new Variant({
    uri: 'hi/main/audio-video.m3u8',
    bandwidth: 7680000,
    codecs: 'avc1.640029,mp4a.40.2',
    video: createRendition('hi')
  }));
  return variants;
}

module.exports = playlist;
