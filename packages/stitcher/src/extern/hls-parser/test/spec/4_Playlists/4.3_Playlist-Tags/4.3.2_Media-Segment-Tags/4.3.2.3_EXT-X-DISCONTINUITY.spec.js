const test = require('ava');
const HLS = require('../../../../..');

// The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
// Media Segment that follows it and the one that preceded it.
test('#EXT-X-DISCONTINUITY_01', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXT-X-DISCONTINUITY
    #EXTINF:10,
    http://example.com/2
    #EXTINF:10,
    http://example.com/3
  `);
  t.falsy(playlist.segments[0].discontinuity);
  t.true(playlist.segments[1].discontinuity);
  t.falsy(playlist.segments[2].discontinuity);
});
