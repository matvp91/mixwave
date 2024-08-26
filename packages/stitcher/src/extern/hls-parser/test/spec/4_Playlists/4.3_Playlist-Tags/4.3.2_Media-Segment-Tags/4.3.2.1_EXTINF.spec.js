const test = require('ava');
const utils = require('../../../../helpers/utils');

// This tag is REQUIRED for each Media Segment
test('#EXTINF_01', t => {
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
    http://example.com/2
  `);
});

// If the compatibility version number is less than 3,
// durations MUST be integers.
test('#EXTINF_02', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXTINF:9.9,
    http://example.com/1
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-TARGETDURATION:10
    #EXTINF:9.9,
    http://example.com/1
  `);
});

// The remainder of the line following the comma is an optional human-
// readable informative title of the Media Segment expressed as raw
// UTF-8 text.
test('#EXTINF_03', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,abc
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,${unescape(encodeURIComponent('\u3042'))}
    http://example.com/1
  `);
});
