const test = require('ava');
const HLS = require('../../..');
const utils = require('../../helpers/utils');

// Starting with iOS 3.1, if the client is unable to reload the index file for a stream (due to a 404 error, for example),
// the client attempts to switch to an alternate stream.
test('Redundant_Streams_01', t => {
  const sourceText = `
  #EXTM3U
  #EXT-X-STREAM-INF:BANDWIDTH=200000, RESOLUTION=720x480
  http://ALPHA.mycompany.com/lo/prog_index.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=200000, RESOLUTION=720x480
  http://BETA.mycompany.com/lo/prog_index.m3u8

  #EXT-X-STREAM-INF:BANDWIDTH=500000, RESOLUTION=1920x1080
  http://ALPHA.mycompany.com/md/prog_index.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=500000, RESOLUTION=1920x1080
  http://BETA.mycompany.com/md/prog_index.m3u8
  `;
  const obj = HLS.parse(sourceText);
  const text = HLS.stringify(obj);
  t.is(text, utils.stripCommentsAndEmptyLines(sourceText));
});
