const test = require('ava');
const utils = require('../../../../helpers/utils');

// The value of the METHOD attribute MUST NOT be NONE
test('#EXT-X-SESSION-KEY_01', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-SESSION-KEY:METHOD=NONE
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com"
  `);
});

// A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY
// tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS
// attribute values.
test('#EXT-X-SESSION-KEY_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221101
  `);
});
