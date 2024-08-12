const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

test('#EXT-X-STREAM-INF_07-03', t => {
  const sourceText = `
  #EXTM3U
  #EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS=NONE
  /video/main.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=2040000,CLOSED-CAPTIONS=NONE
  /video/high.m3u8
  `;
  HLS.setOptions({allowClosedCaptionsNone: true});
  const obj = HLS.parse(sourceText);
  const text = HLS.stringify(obj);
  t.is(text, utils.stripCommentsAndEmptyLines(sourceText));
});
