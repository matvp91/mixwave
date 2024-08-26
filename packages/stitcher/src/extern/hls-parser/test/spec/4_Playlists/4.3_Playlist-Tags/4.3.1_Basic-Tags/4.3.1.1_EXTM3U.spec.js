const test = require('ava');
const utils = require('../../../../helpers/utils');

// It MUST be the first line of every Media Playlist and
// every Master Playlist.
test('#EXTM3U-01', t => {
  // Media Playlist
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXT-X-TARGETDURATION:10
    #EXTM3U
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  // Master Playlist
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
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    http://example.com/low.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=2560000
    http://example.com/mid.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=7680000
    http://example.com/hi.m3u8
  `);
});
