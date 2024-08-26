const {MasterPlaylist, Variant, Rendition} = require('../../../types');

const renditions = [
  new Rendition({type: 'AUDIO', groupId: 'aac_high', name: 'English', isDefault: true, uri: 'aac_high_eng.m3u8'}),
  new Rendition({type: 'AUDIO', groupId: 'aac_high', name: 'Japanese', isDefault: false, uri: 'aac_high_jp.m3u8'}),
  new Rendition({type: 'AUDIO', groupId: 'aac_mid', name: 'English', isDefault: true, uri: 'aac_mid_eng.m3u8'}),
  new Rendition({type: 'AUDIO', groupId: 'aac_mid', name: 'Japanese', isDefault: false, uri: 'aac_mid_jp.m3u8'}),
  new Rendition({type: 'AUDIO', groupId: 'aac_low', name: 'English', isDefault: true, uri: 'aac_low_eng.m3u8'}),
  new Rendition({type: 'AUDIO', groupId: 'aac_low', name: 'Japanese', isDefault: false, uri: 'aac_low_jp.m3u8'}),
];
const variants = [
  {uri: '1080p.m3u8', bandwidth: 6000000, audioId: 'aac_high'},
  {uri: '720p.m3u8', bandwidth: 3000000, audioId: 'aac_mid'},
  {uri: '540p.m3u8', bandwidth: 1500000, audioId: 'aac_mid'},
  {uri: '360p.m3u8', bandwidth: 1000000, audioId: 'aac_low'},
].map(
  ({uri, bandwidth, audioId}) => new Variant({
    uri, bandwidth, audio: renditions.filter(({groupId}) => groupId === audioId)
  })
);

const playlist = new MasterPlaylist({
  version: 4,
  independentSegments: true,
  variants,
});

module.exports = playlist;
