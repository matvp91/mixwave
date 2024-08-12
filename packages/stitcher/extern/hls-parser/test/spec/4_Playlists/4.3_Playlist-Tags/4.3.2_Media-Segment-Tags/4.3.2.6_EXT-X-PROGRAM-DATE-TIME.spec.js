const test = require('ava');
const HLS = require('../../../../..');

// It applies only to the next Media Segment.
test('#EXT-X-PROGRAM-DATE-TIME_01', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  t.truthy(playlist.segments[0].programDateTime);
  t.falsy(playlist.segments[1].programDateTime);
});
