const test = require('ava');
const utils = require('../../../../helpers/utils');

// A Media Segment tag MUST NOT appear in a Master Playlist.  Clients
// MUST reject Playlists that contain both Media Segment Tags and Master
// Playlist tags.
test('Media-Segment-Tags', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    http://example.com/low.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=2560000
    http://example.com/mid.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=7680000
    http://example.com/hi.m3u8
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    http://example.com/low.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=2560000
    http://example.com/mid.m3u8
    #EXT-X-DISCONTINUITY
    #EXT-X-STREAM-INF:BANDWIDTH=7680000
    http://example.com/hi.m3u8
  `);
});
