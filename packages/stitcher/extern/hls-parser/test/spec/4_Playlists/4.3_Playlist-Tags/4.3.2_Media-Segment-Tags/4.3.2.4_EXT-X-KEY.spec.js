const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// It applies to every Media Segment that appears between
// it and the next EXT-X-KEY tag in the Playlist file with the same
// KEYFORMAT attribute (or the end of the Playlist file).
test('#EXT-X-KEY_01', t => {
  let playlist;
  // Until the end of the Playlist file
  playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
    #EXTINF:10,
    http://example.com/2
    #EXTINF:10,
    http://example.com/3
  `);
  t.falsy(playlist.segments[0].key);
  t.truthy(playlist.segments[1].key);
  t.truthy(playlist.segments[2].key);
  // Until the next EXT-X-KEY tag in the Playlist file with the same
  // KEYFORMAT attribute
  playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-1",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-2",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com/3
  `);
  t.is(playlist.segments[0].key.uri, 'http://example.com/key-1');
  t.is(playlist.segments[1].key.uri, 'http://example.com/key-1');
  t.is(playlist.segments[2].key.uri, 'http://example.com/key-2');
});

// METHOD: This attribute is REQUIRED.
test('#EXT-X-KEY_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:URI="http://example.com"
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
    #EXTINF:10,
    http://example.com/2
  `);
});

// If the encryption method is NONE, other attributes
// MUST NOT be present.
test('#EXT-X-KEY_03', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=NONE,URI="http://example.com"
    #EXTINF:10,
    http://example.com/2
  `);
});

// URI: This attribute is REQUIRED unless the METHOD is NONE.
test('#EXT-X-KEY_04', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128
    #EXTINF:10,
    http://example.com/2
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=NONE
    #EXTINF:10,
    http://example.com/2
  `);
});

// Use of the IV attribute REQUIRES a compatibility version number of
// 2 or greater.
test('#EXT-X-KEY_05', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:1
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
    #EXTINF:10,
    http://example.com/2
  `);
  const playlist = utils.parsePass(t, `
    #EXTM3U
    #EXT-X-VERSION:2
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com",IV=0xFFEEDDCCBBAA99887766554433221100
    #EXTINF:10,
    http://example.com/2
  `);
  t.is(playlist.segments[0].key.iv.length, 16);
});

// The tag place should be preserved
test('#EXT-X-KEY_06', t => {
  const sourceText = `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-1",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-2",KEYFORMAT="identity"
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
test('#EXT-X-KEY_07', t => {
  const sourceText = `
    #EXTM3U
    #EXT-X-VERSION:5
    #EXT-X-TARGETDURATION:10
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-1",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com/1
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-2",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com/2
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-1",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com/3
    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com/key-2",KEYFORMAT="identity"
    #EXTINF:10,
    http://example.com/4
  `;
  const obj = HLS.parse(sourceText);
  const text = HLS.stringify(obj);
  t.is(text, utils.stripCommentsAndEmptyLines(sourceText));
});
