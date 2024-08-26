const test = require('ava');
const utils = require('../../../../helpers/utils');

// Every EXT-X-I-FRAME-STREAM-INF tag MUST include a BANDWIDTH attribute
// and a URI attribute.
test('#EXT-X-I-FRAME-STREAM-INF_01', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=1280000
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=1280000,URI=/video/main.m3u8
  `);
});
