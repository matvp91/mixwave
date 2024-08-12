const test = require('ava');
const utils = require('../../../../helpers/utils');

// There MUST NOT be more than one Media Playlist tag of each type in
// any Media Playlist.
test('Media-Playlist-Tags', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/2
  `);
});

// A Media Playlist Tag MUST NOT appear in a Master Playlist
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
    #EXT-X-STREAM-INF:BANDWIDTH=7680000
    http://example.com/hi.m3u8
    #EXT-X-ENDLIST
  `);
});
