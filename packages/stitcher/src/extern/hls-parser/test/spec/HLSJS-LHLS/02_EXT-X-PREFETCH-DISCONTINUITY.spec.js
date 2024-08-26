const test = require("ava");
const utils = require("../../helpers/utils");
const HLS = require("../../..");

test("#EXT-X-PREFETCH-DISCONTINUITY_01", t => {
  const text = `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 0
    #EXT-X-DISCONTINUITY-SEQUENCE: 0
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
    #EXTINF:2.000
    https://foo.com/bar/0.ts
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts

    #EXT-X-PREFETCH-DISCONTINUITY
    #EXT-X-PREFETCH:https://foo.com/bar/5.ts
    #EXT-X-PREFETCH:https://foo.com/bar/6.ts
  `;
  utils.bothPass(t, text);
  const {prefetchSegments} = HLS.parse(text);
  t.is(prefetchSegments.length, 2);
  t.true(prefetchSegments[0].discontinuity);
  t.falsy(prefetchSegments[1].discontinuity);
});

test("#EXT-X-PREFETCH-DISCONTINUITY_02", t => {
  const text = `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 1
    #EXT-X-DISCONTINUITY-SEQUENCE: 0
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts
    #EXT-X-DISCONTINUITY
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T21:59:10.531Z
    #EXTINF:2.000
    https://foo.com/bar/5.ts

    #EXT-X-PREFETCH:https://foo.com/bar/6.ts
    #EXT-X-PREFETCH-DISCONTINUITY
    #EXT-X-PREFETCH:https://foo.com/bar/9.ts
  `;
  utils.bothPass(t, text);
  const {prefetchSegments} = HLS.parse(text);
  t.is(prefetchSegments.length, 2);
  t.falsy(prefetchSegments[0].discontinuity);
  t.true(prefetchSegments[1].discontinuity);
});
