const test = require('ava');
const utils = require('../../../../helpers/utils');

test('#EXT-X-CUE-OUT_01', t => {
  let obj = utils.parsePass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-VERSION:3
    #EXTINF:9,
    http://example.com/1
    #EXT-X-CUE-OUT:30
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(obj.segments[1].markers[0].duration, 30);
  obj = utils.parsePass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-VERSION:3
    #EXTINF:9,
    http://example.com/1
    #EXT-X-CUE-OUT:DURATION=30
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(obj.segments[1].markers[0].duration, 30);
});
