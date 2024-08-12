const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// It applies only to the next URI line that follows it in the Playlist.
test('#EXT-X-BYTERANGE_01', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:100@200
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(playlist.segments[0].byterange.offset, 200);
  t.is(playlist.segments[0].byterange.length, 100);
  t.falsy(playlist.segments[1].byterange);
});

// If o is not present, the sub-range begins at the next byte following
// the sub-range of the previous Media Segment.
test('#EXT-X-BYTERANGE_02', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:100@200
    #EXTINF:9.9,
    http://example.com/1
    #EXT-X-BYTERANGE:100
    #EXTINF:9.9,
    http://example.com/1
    #EXT-X-BYTERANGE:100
    #EXTINF:9.9,
    http://example.com/1
  `);
  t.is(playlist.segments[0].byterange.offset, 200);
  t.is(playlist.segments[1].byterange.offset, 300);
  t.is(playlist.segments[2].byterange.offset, 400);
});

// If o is not present, a previous Media Segment MUST appear in the
// Playlist file and MUST be a sub-range of the same media resource, or
// the Media Segment is undefined and the Playlist MUST be rejected.
test('#EXT-X-BYTERANGE_03', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:100
    #EXTINF:9.9,
    http://example.com/1
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:100@200
    #EXTINF:9.9,
    http://example.com/1
    #EXT-X-BYTERANGE:100
    #EXTINF:9.9,
    http://example.com/1
    #EXT-X-BYTERANGE:100
    #EXTINF:9.9,
    http://example.com/2
  `);
  utils.parsePass(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:100@200
    #EXTINF:9.9,
    http://example.com/1
    #EXT-X-BYTERANGE:100
    #EXTINF:9.9,
    http://example.com/1
    #EXT-X-BYTERANGE:100@200
    #EXTINF:9.9,
    http://example.com/2
  `);
});

// Use of the EXT-X-BYTERANGE tag REQUIRES a compatibility version
// number of 4 or greater.
test('#EXT-X-BYTERANGE_04', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:100@200
    #EXTINF:9.9,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-BYTERANGE:100@200
    #EXTINF:9.9,
    http://example.com/1
  `);
});

// EXT-X-BYTERANGE should come at end of segment.
test('#EXT-X-BYTERANGE_05', t => {
  t.is(
    utils.bothPass(t, `
        #EXTM3U
        #EXT-X-VERSION:4
        #EXT-X-TARGETDURATION:10
        #EXTINF:9.9,comment
        #EXT-X-BYTERANGE:100@200
        http://example.com/1
        #EXT-X-DISCONTINUITY
        #EXTINF:9.9,comment
        #EXT-X-BYTERANGE:100@200
        http://example.com/2
    `),
    utils.stripCommentsAndEmptyLines(`
        #EXTM3U
        #EXT-X-VERSION:4
        #EXT-X-TARGETDURATION:10
        #EXTINF:9.9,comment
        #EXT-X-BYTERANGE:100@200
        http://example.com/1
        #EXT-X-DISCONTINUITY
        #EXTINF:9.9,comment
        #EXT-X-BYTERANGE:100@200
        http://example.com/2
    `)
  );
});
