const test = require('ava');
const utils = require('../../../../helpers/utils');

// It MAY occur anywhere in the Media Playlist file.
test('#EXT-X-ENDLIST_01', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-ENDLIST
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-ENDLIST
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    #EXT-X-ENDLIST
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    http://example.com/1
    #EXT-X-ENDLIST
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    #EXT-X-ENDLIST
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-ENDLIST
  `);
});
