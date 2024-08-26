const test = require('ava');
const utils = require('../../helpers/utils');

// A Playlist that contains tags or attributes that are not compatible
// with protocol version 1 MUST include an EXT-X-VERSION tag.
test('#EXT-X-VERSION_02', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com"
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-SESSION-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 2 or higher if it
// contains:
// - The IV attribute of the EXT-X-KEY tag.
test('#EXT-X-VERSION_03', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:1
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:1
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
    #EXTINF:10,
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
    #EXTINF:10,
    http://example.com
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 3 or higher if it
// contains:
// - Floating-point EXTINF duration values.
test('#EXT-X-VERSION_04', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-TARGETDURATION:10
    #EXTINF:9.9,
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXTINF:9.9,
    http://example.com
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 4 or higher if it
// contains:
// - The EXT-X-BYTERANGE tag.
test('#EXT-X-VERSION_05', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:256@100
    #EXTINF:10,
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:256@100
    #EXTINF:10,
    http://example.com
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 4 or higher if it
// contains:
// - The EXT-X-I-FRAMES-ONLY tag.
test('#EXT-X-VERSION_06', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 5 or higher if it
// contains:
// - The KEYFORMAT attributes of the EXT-X-KEY tag.
test('#EXT-X-VERSION_07', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 5 or higher if it
// contains:
// - The KEYFORMATVERSIONS attributes of the EXT-X-KEY tag.
test('#EXT-X-VERSION_08', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",KEYFORMATVERSIONS="1"
    #EXTINF:10,
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",KEYFORMATVERSIONS="1"
    #EXTINF:10,
    http://example.com  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 5 or higher if it
// contains:
// - The EXT-X-MAP tag.
test('#EXT-X-VERSION_09', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
    #EXT-X-MAP:URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
    #EXT-X-MAP:URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 6 or higher if it
// contains:
// - The EXT-X-MAP tag in a Media Playlist that does not contain EXT-X-I-FRAMES-ONLY.
test('#EXT-X-VERSION_10', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
    #EXT-X-MAP:URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com"
    #EXTINF:10,
    http://example.com
  `);
});

// A Master Playlist MUST indicate a EXT-X-VERSION of 7 or higher if it
// contains:
// - "SERVICE" values for the INSTREAM-ID attribute of the EXT-X-MEDIA tag.
test('#EXT-X-VERSION_11', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc",NAME="JP",INSTREAM-ID="CC1"
    #EXT-X-STREAM-INF:BANDWIDTH=500000,CLOSED-CAPTIONS="cc"
    http://example.com
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc",NAME="JP",INSTREAM-ID="SERVICE1"
    #EXT-X-STREAM-INF:BANDWIDTH=500000,CLOSED-CAPTIONS="cc"
    http://example.com
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:7
    #EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc",NAME="JP",INSTREAM-ID="SERVICE1"
    #EXT-X-STREAM-INF:BANDWIDTH=500000,CLOSED-CAPTIONS="cc"
    http://example.com
  `);
});

// A Media Playlist MUST indicate a EXT-X-VERSION of 8 or higher if it
// contains:
// - the "EXT-X-GAP" tag.
test('#EXT-X-VERSION_12', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:1
    #EXTINF:5
    #EXT-X-GAP
    http://example.com
  `);
});
