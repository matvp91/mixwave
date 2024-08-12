const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// If the Media Playlist does not contain an EXT-X-DISCONTINUITY-
// SEQUENCE tag, then the Discontinuity Sequence Number of the first
// Media Segment in the Playlist SHALL be considered to be 0.
test('#EXT-X-DISCONTINUITY-SEQUENCE_01', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXT-X-DISCONTINUITY
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(playlist.discontinuitySequenceBase, 0);
});

// The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first
// Media Segment in the Playlist.
test('#EXT-X-DISCONTINUITY-SEQUENCE_02', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-DISCONTINUITY-SEQUENCE:20
    #EXTINF:9,
    http://example.com/1
    #EXT-X-DISCONTINUITY
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    http://example.com/1
    #EXT-X-DISCONTINUITY-SEQUENCE:20
    #EXT-X-DISCONTINUITY
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    #EXT-X-DISCONTINUITY-SEQUENCE:20
    http://example.com/1
    #EXT-X-DISCONTINUITY
    #EXTINF:10,
    http://example.com/2
  `);
});

// The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any
// EXT-X-DISCONTINUITY tag.
test('#EXT-X-DISCONTINUITY-SEQUENCE_03', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-DISCONTINUITY
    #EXT-X-DISCONTINUITY-SEQUENCE:20
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-DISCONTINUITY-SEQUENCE:20
    #EXT-X-DISCONTINUITY
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
});
