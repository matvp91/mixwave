const test = require('ava');
const utils = require('../../../helpers/utils');
const HLS = require('../../../..');

// SKIPPED-SEGMENTS=<N>: (mandatory)
test('#EXT-X-SKIP_01', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:9
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXT-X-PART-INF:PART-TARGET=0.2
    #EXT-X-SKIP:SKIPPED-SEGMENTS=20
    #EXTINF:2,
    fs240.mp4
    #EXTINF:2,
    fs241.mp4
    #EXTINF:2,
    fs242.mp4
    #EXTINF:2,
    fs243.mp4
    #EXTINF:2,
    fs244.mp4
    #EXTINF:2,
    fs245.mp4
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:9
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXT-X-PART-INF:PART-TARGET=0.2
    #EXT-X-SKIP:NUM=20
    #EXTINF:2,
    fs240.mp4
    #EXTINF:2,
    fs241.mp4
    #EXTINF:2,
    fs242.mp4
    #EXTINF:2,
    fs243.mp4
    #EXTINF:2,
    fs244.mp4
    #EXTINF:2,
    fs245.mp4
  `);
});

// SKIPPED-SEGMENTS=<N>: (mandatory) Indicates how many
// Media Segments were replaced by the EXT-X-SKIP tag,
// along with their associated tags.
test('#EXT-X-SKIP_02', t => {
  const {skip, segments} = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:9
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE:9000
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXT-X-PART-INF:PART-TARGET=0.2
    #EXT-X-SKIP:SKIPPED-SEGMENTS=20
    #EXTINF:2,
    fs240.mp4
    #EXTINF:2,
    fs241.mp4
    #EXTINF:2,
    fs242.mp4
    #EXTINF:2,
    fs243.mp4
    #EXTINF:2,
    fs244.mp4
    #EXTINF:2,
    fs245.mp4
  `);

  t.is(skip, 20);
  t.is(segments[0].mediaSequenceNumber, 9020);
});

// A Playlist containing an EXT-X-SKIP tag must have
// an EXT-X-VERSION tag with a value of nine or higher.
test('#EXT-X-SKIP_03', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-VERSION:9
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXT-X-PART-INF:PART-TARGET=0.2
    #EXT-X-SKIP:SKIPPED-SEGMENTS=20
    #EXTINF:2,
    fs240.mp4
    #EXTINF:2,
    fs241.mp4
    #EXTINF:2,
    fs242.mp4
    #EXTINF:2,
    fs243.mp4
    #EXTINF:2,
    fs244.mp4
    #EXTINF:2,
    fs245.mp4
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:8
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXT-X-PART-INF:PART-TARGET=0.2
    #EXT-X-SKIP:SKIPPED-SEGMENTS=20
    #EXTINF:2,
    fs240.mp4
    #EXTINF:2,
    fs241.mp4
    #EXTINF:2,
    fs242.mp4
    #EXTINF:2,
    fs243.mp4
    #EXTINF:2,
    fs244.mp4
    #EXTINF:2,
    fs245.mp4
  `);
});
