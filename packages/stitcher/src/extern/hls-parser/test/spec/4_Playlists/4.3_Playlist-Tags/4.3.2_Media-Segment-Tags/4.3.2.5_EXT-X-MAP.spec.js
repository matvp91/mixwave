const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// It applies to every Media Segment that appears after it in the
// Playlist until the next EXT-X-MAP tag or until the end of the
// playlist.
test('#EXT-X-MAP_01', t => {
  let playlist;
  // Until the end of the Playlist
  playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXT-X-MAP:URI="http://example.com/map-1"
    #EXTINF:10,
    http://example.com/2
    #EXTINF:10,
    http://example.com/3
  `);
  t.falsy(playlist.segments[0].map);
  t.truthy(playlist.segments[1].map);
  t.truthy(playlist.segments[2].map);
  // Until the next EXT-X-MAP tag
  playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com/map-1"
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-MAP:URI="http://example.com/map-2"
    #EXTINF:10,
    http://example.com/3
  `);
  t.is(playlist.segments[0].map.uri, 'http://example.com/map-1');
  t.is(playlist.segments[1].map.uri, 'http://example.com/map-1');
  t.is(playlist.segments[2].map.uri, 'http://example.com/map-2');
  HLS.stringify(playlist);
});

// URI: This attribute is REQUIRED.
test('#EXT-X-MAP_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:BYTERANGE="256@128"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com/map-1",BYTERANGE="256@128"
    #EXTINF:10,
    http://example.com/1
  `);
});

// Use of the EXT-X-MAP tag in a Media Playlist that contains the
// EXT-X-I-FRAMES-ONLY tag REQUIRES a compatibility version number of 5
// or greater.
// URI: This attribute is REQUIRED.
test('#EXT-X-MAP_03', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
    #EXT-X-MAP:URI="http://example.com/map-1",BYTERANGE="256@128"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-I-FRAMES-ONLY
    #EXT-X-MAP:URI="http://example.com/map-1",BYTERANGE="256@128"
    #EXTINF:10,
    http://example.com/1
  `);
});

// Use of the EXT-X-MAP tag in a Media Playlist that DOES
// NOT contain the EXT-X-I-FRAMES-ONLY tag REQUIRES a compatibility
// version number of 6 or greater.
test('#EXT-X-MAP_04', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com/map-1",BYTERANGE="256@128"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com/map-1",BYTERANGE="256@128"
    #EXTINF:10,
    http://example.com/1
  `);
});

// The tag place should be preserved
test('#EXT-X-MAP_05', t => {
  const sourceText = `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com/map-1"
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-MAP:URI="http://example.com/map-2"
    #EXTINF:10,
    http://example.com/3
    #EXTINF:10,
    http://example.com/4
  `;
  const obj = HLS.parse(sourceText);
  const text = HLS.stringify(obj);
  t.is(text, utils.stripCommentsAndEmptyLines(sourceText));
});

// The same tag can appear multiple times
test('#EXT-X-MAP_06', t => {
  const sourceText = `
    #EXTM3U
    #EXT-X-VERSION:6
    #EXT-X-TARGETDURATION:10
    #EXT-X-MAP:URI="http://example.com/map-1"
    #EXTINF:10,
    http://example.com/1
    #EXT-X-MAP:URI="http://example.com/map-2"
    #EXTINF:10,
    http://example.com/2
    #EXT-X-MAP:URI="http://example.com/map-1"
    #EXTINF:10,
    http://example.com/3
    #EXT-X-MAP:URI="http://example.com/map-2"
    #EXTINF:10,
    http://example.com/4
  `;
  const obj = HLS.parse(sourceText);
  const text = HLS.stringify(obj);
  t.is(text, utils.stripCommentsAndEmptyLines(sourceText));
});
