const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// The tags in this section can appear in either Master Playlists or
// Media Playlists.
test('#EXT-X-INDEPENDENT-SEGMENTS_01', t => {
  const mediaPlaylist = HLS.parse(`
    #EXTM3U
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.true(mediaPlaylist.independentSegments);
  const masterPlaylist = HLS.parse(`
    #EXTM3U
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
  `);
  t.true(masterPlaylist.independentSegments);
});

// These tags MUST NOT appear more than once in a Playlist.  If a tag
// appears more than once, clients MUST reject the playlist.
test('#EXT-X-INDEPENDENT-SEGMENTS_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-INDEPENDENT-SEGMENTS
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
    #EXT-X-INDEPENDENT-SEGMENTS
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
  `);
});
