const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// If the Media Playlist file does not contain an EXT-X-MEDIA-SEQUENCE
// tag then the Media Sequence Number of the first Media Segment in the
// Media Playlist SHALL be considered to be 0.
test('#EXT-X-MEDIA-SEQUENCE_01', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(playlist.mediaSequenceBase, 0);
});

// The EXT-X-MEDIA-SEQUENCE tag MUST appear before the first Media
// Segment in the Playlist.
test('#EXT-X-MEDIA-SEQUENCE_02', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-MEDIA-SEQUENCE:20
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    http://example.com/1
    #EXT-X-MEDIA-SEQUENCE:20
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    #EXT-X-MEDIA-SEQUENCE:20
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
});
