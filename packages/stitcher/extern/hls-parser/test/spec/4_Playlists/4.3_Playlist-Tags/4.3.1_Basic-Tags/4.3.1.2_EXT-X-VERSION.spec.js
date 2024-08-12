const test = require('ava');
const utils = require('../../../../helpers/utils');

// A Playlist file MUST NOT contain more than one EXT-X-VERSION tag.
test('#EXT-X-VERSION_01', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXTINF:9.9,
    http://example.com/1
    #EXTINF:10.0,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXTINF:9.9,
    http://example.com/1
    #EXTINF:10.0,
    http://example.com/2
    #EXT-X-VERSION:4
  `);
});
