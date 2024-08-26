const test = require('ava');
const utils = require('../../../helpers/utils');
const HLS = require('../../../..');

// URI=<uri>: (mandatory)
test('#EXT-X-RENDITION-REPORT_01', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXTINF:2,
    fs240.mp4
    #EXT-X-RENDITION-REPORT:URI="mid.m3u8",LAST-MSN=1999
    #EXT-X-RENDITION-REPORT:URI="high.m3u8",LAST-MSN=1999
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXTINF:2,
    fs240.mp4
    #EXT-X-RENDITION-REPORT:LAST-MSN=1999
    #EXT-X-RENDITION-REPORT:LAST-MSN=1999
  `);
});

// URI=<uri>: (mandatory) ... It must be relative to the URI of the Media Playlist
// containing the EXT-X-RENDITION-REPORT tag.
test('#EXT-X-RENDITION-REPORT_02', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXTINF:2,
    fs240.mp4
    #EXT-X-RENDITION-REPORT:URI="mid.m3u8",LAST-MSN=1999
    #EXT-X-RENDITION-REPORT:URI="high.m3u8",LAST-MSN=1999
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:2
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXTINF:2,
    fs240.mp4
    #EXT-X-RENDITION-REPORT:URI="https://example.com/mid.m3u8",LAST-MSN=1999
    #EXT-X-RENDITION-REPORT:URI="https://example.com/high.m3u8",LAST-MSN=1999
  `);
});

// A server may omit adding an attribute to an EXT-X-RENDITION-REPORT
// tag — even a mandatory attribute — if its value is the same as that
// of the Rendition Report of the Media Playlist to which the EXT-X-RENDITION-REPORT
// tag is being added. This step reduces the size of the Rendition Report.
test('#EXT-X-RENDITION-REPORT_03', t => {
  const {renditionReports} = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE:1990
    #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
    #EXT-X-PART-INF:PART-TARGET=0.2
    #EXTINF:2,
    fs240.mp4
    #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0
    #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@20000
    #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
    #EXT-X-RENDITION-REPORT:URI="main-0.m3u8"
    #EXT-X-RENDITION-REPORT:URI="main-1.m3u8"
  `);

  t.is(renditionReports.length, 2);
  for (const [index, report] of renditionReports.entries()) {
    t.is(report.uri, `main-${index}.m3u8`);
    t.is(report.lastMSN, 1991);
    t.is(report.lastPart, 2);
  }
});

// Handle 0-indexed segment parts in rendition reports
test('#EXT-X-RENDITION-REPORT_04', t => {
  const {renditionReports} = HLS.parse(`
  #EXTM3U
  #EXT-X-VERSION:6
  #EXT-X-TARGETDURATION:3
  #EXT-X-SERVER-CONTROL:PART-HOLD-BACK=3.150000,CAN-BLOCK-RELOAD=YES
  #EXT-X-PART-INF:PART-TARGET=1
  #EXT-X-PROGRAM-DATE-TIME:2022-08-12T15:53:22Z
  media_b128000_cmaf_a_6.mp4
  #EXT-X-PROGRAM-DATE-TIME:2022-08-12T15:53:31Z
  #EXT-X-PART:DURATION=1,INDEPENDENT=YES,URI="media_b128000_cmaf_a_7_p0.mp4"
  #EXT-X-PRELOAD-HINT:TYPE=PART,URI="media_b128000_cmaf_a_7_p1.mp4"
  #EXT-X-RENDITION-REPORT:URI="chunklist_b56000_cmaf_a.m3u8?max_segments=10",LAST-MSN=7,LAST-PART=0
  #EXT-X-RENDITION-REPORT:URI="chunklist_b256000_cmaf_a.m3u8?max_segments=10",LAST-MSN=7,LAST-PART=0
  `);

  t.is(renditionReports.length, 2);
  for (const [index, report] of renditionReports.entries()) {
    console.log(index, report);
    t.is(report.lastMSN, 7);
    t.is(report.lastPart, 0);
  }
});
