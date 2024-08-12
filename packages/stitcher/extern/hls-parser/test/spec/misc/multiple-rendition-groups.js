const test = require("ava");
const utils = require("../../helpers/utils");
const HLS = require("../../..");

test("Multiple-Rendition-Groups_01", t => {
  const shouldRead = `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_high",NAME="English",DEFAULT=YES,URI="aac_high_eng.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_high",NAME="Japanese",DEFAULT=NO,URI="aac_high_jp.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_mid",NAME="English",DEFAULT=YES,URI="aac_mid_eng.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_mid",NAME="Japanese",DEFAULT=NO,URI="aac_mid_jp.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_low",NAME="English",DEFAULT=YES,URI="aac_low_eng.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_low",NAME="Japanese",DEFAULT=NO,URI="aac_low_jp.m3u8"
    #EXT-X-STREAM-INF:BANDWIDTH=6000000,AUDIO="aac_high"
    1080p.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=3000000,AUDIO="aac_mid"
    720p.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=1500000,AUDIO="aac_mid"
    540p.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=1000000,AUDIO="aac_low"
    360p.m3u8
  `;

  const playlist = HLS.parse(shouldRead);

  const shouldWrite = `
    #EXTM3U
    #EXT-X-VERSION:4
    #EXT-X-INDEPENDENT-SEGMENTS
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_high",NAME="English",DEFAULT=YES,URI="aac_high_eng.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_high",NAME="Japanese",DEFAULT=NO,URI="aac_high_jp.m3u8"
    #EXT-X-STREAM-INF:BANDWIDTH=6000000,AUDIO="aac_high"
    1080p.m3u8
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_mid",NAME="English",DEFAULT=YES,URI="aac_mid_eng.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_mid",NAME="Japanese",DEFAULT=NO,URI="aac_mid_jp.m3u8"
    #EXT-X-STREAM-INF:BANDWIDTH=3000000,AUDIO="aac_mid"
    720p.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=1500000,AUDIO="aac_mid"
    540p.m3u8
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_low",NAME="English",DEFAULT=YES,URI="aac_low_eng.m3u8"
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac_low",NAME="Japanese",DEFAULT=NO,URI="aac_low_jp.m3u8"
    #EXT-X-STREAM-INF:BANDWIDTH=1000000,AUDIO="aac_low"
    360p.m3u8
  `;

  t.is(HLS.stringify(playlist), utils.stripCommentsAndEmptyLines(shouldWrite));
});
