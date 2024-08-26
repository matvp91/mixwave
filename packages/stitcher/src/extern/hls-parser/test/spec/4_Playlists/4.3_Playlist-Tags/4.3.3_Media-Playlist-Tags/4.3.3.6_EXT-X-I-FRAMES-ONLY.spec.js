const test = require('ava');
const utils = require('../../../../helpers/utils');

// Use of the EXT-X-I-FRAMES-ONLY REQUIRES a compatibility version
// number of 4 or greater.
test('#EXT-X-I-FRAMES-ONLY_01', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-VERSION:3
    #EXT-X-I-FRAMES-ONLY
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-VERSION:4
    #EXT-X-I-FRAMES-ONLY
    #EXTINF:9,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
});
