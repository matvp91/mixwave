const test = require('ava');
const HLS = require('../../../../..');

// #EXT-X-PLAYLIST-TYPE:<EVENT|VOD>
test('#EXT-X-PLAYLIST-TYPE_01', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PLAYLIST-TYPE:EVENT
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(playlist.playlistType, 'EVENT');
});

// #EXT-X-PLAYLIST-TYPE:<EVENT|VOD>
test('#EXT-X-PLAYLIST-TYPE_02', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PLAYLIST-TYPE:VOD
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(playlist.playlistType, 'VOD');
});

// #EXT-X-PLAYLIST-TYPE:<EVENT|VOD>
test('#EXT-X-PLAYLIST-TYPE_03', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(playlist.playlistType, undefined);
});
