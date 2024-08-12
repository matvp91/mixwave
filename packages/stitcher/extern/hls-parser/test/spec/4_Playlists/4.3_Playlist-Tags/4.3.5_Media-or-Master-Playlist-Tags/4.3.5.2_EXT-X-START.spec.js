const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// The tags in this section can appear in either Master Playlists or
// Media Playlists.
test('#EXT-X-START_01', t => {
  const mediaPlaylist = HLS.parse(`
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10,PRECISE=YES
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(mediaPlaylist.start.offset, -10);
  t.true(mediaPlaylist.start.precise);
  const masterPlaylist = HLS.parse(`
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10,PRECISE=YES
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
  `);
  t.is(masterPlaylist.start.offset, -10);
  t.true(masterPlaylist.start.precise);
});

// These tags MUST NOT appear more than once in a Playlist.  If a tag
// appears more than once, clients MUST reject the playlist.
test('#EXT-X-START_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-START:TIME-OFFSET=-20
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
    #EXT-X-START:TIME-OFFSET=-20
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
  `);
});

// TIME-OFFSET attribute is REQUIRED.
test('#EXT-X-START_03', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-START:PRECISE=YES
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10,PRECISE=YES
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-START:PRECISE=YES
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-START:TIME-OFFSET=-10,PRECISE=YES
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=640000
    /video/low.m3u8
  `);
});
