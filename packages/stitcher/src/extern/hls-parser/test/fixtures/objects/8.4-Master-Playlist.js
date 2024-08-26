const {MasterPlaylist, Variant} = require('../../../types');

const playlist = new MasterPlaylist({
  variants: createVariants()
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: 'http://example.com/low.m3u8',
    bandwidth: 1280000,
    averageBandwidth: 1000000,
    codecs: 'avc1.640029,mp4a.40.2'
  }));
  variants.push(new Variant({
    uri: 'http://example.com/mid.m3u8',
    bandwidth: 2560000,
    averageBandwidth: 2000000,
    codecs: 'avc1.640029,mp4a.40.2'
  }));
  variants.push(new Variant({
    uri: 'http://example.com/hi.m3u8',
    bandwidth: 7680000,
    averageBandwidth: 6000000,
    codecs: 'avc1.640029,mp4a.40.2'
  }));
  variants.push(new Variant({
    uri: 'http://example.com/audio-only.m3u8',
    bandwidth: 65000,
    codecs: 'mp4a.40.5'
  }));
  return variants;
}

module.exports = playlist;
