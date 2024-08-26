const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// ID attribute is REQUIRED.
test('#EXT-X-DATERANGE_01', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z"

    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
});

// START-DATE attribute is REQUIRED.
//   * removed because START-DATE is omitted in case of 8.10-EXT-X-DATERANGE-carrying-SCTE-35-tags
/*
test('#EXT-X-DATERANGE_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
});
*/

// START-DATE attribute is not REQUIRED
test('#EXT-X-DATERANGE_02', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
});

// END-DATE MUST be equal to or later than the value of the
// START-DATE attribute.
test('#EXT-X-DATERANGE_03', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",END-DATE="2010-02-19T14:54:22Z",ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",END-DATE="2010-02-19T14:54:23Z",ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
});

// DURATION MUST NOT be negative.
test('#EXT-X-DATERANGE_04', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",DURATION=-180.0,ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",DURATION=180.0,ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
});

// PLANNED-DURATION MUST NOT be negative.
test('#EXT-X-DATERANGE_05', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",PLANNED-DURATION=-180.0,ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",PLANNED-DURATION=180.0,ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
});

// X-<client-attribute>
// The attribute value MUST be a quoted-string,
// a hexadecimal-sequence, or a decimal-floating-point.
test('#EXT-X-DATERANGE_06', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",ID="ads",X-STR="abc"
    #EXTINF:10,
    http://example.com/1
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",ID="ads",X-BYTE=0xFFFEFDFC
    #EXTINF:10,
    http://example.com/2
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:23Z",ID="ads",X-FLOAT=0.999
    #EXTINF:10,
    http://example.com/3
  `);
  t.is(playlist.segments[0].dateRange.attributes['X-STR'], 'abc');
  t.deepEqual(playlist.segments[1].dateRange.attributes['X-BYTE'], new Uint8Array([255, 254, 253, 252]));
  t.is(playlist.segments[2].dateRange.attributes['X-FLOAT'], 0.999);
});

// END-ON-NEXT attribute indicates that the end of the range containing it
// is equal to the START-DATE of its Following Range. The Following Range is
// the Date Range of the same CLASS that has the earliest START-DATE
// after the START-DATE of the range in question.
test('#EXT-X-DATERANGE_07', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads",CLASS="A",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/1
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:55:00Z",ID="ads",CLASS="B",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/2
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:56:00Z",ID="ads",CLASS="A",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/3
  `);
  t.true(playlist.segments[0].dateRange.endOnNext);
  t.not(playlist.segments[0].dateRange.end.getTime(), playlist.segments[1].dateRange.start.getTime());
  t.is(playlist.segments[0].dateRange.end.getTime(), playlist.segments[2].dateRange.start.getTime());
});

// An EXT-X-DATERANGE tag with an END-ON-NEXT=YES attribute MUST have a
// CLASS attribute.
test('#EXT-X-DATERANGE_08', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads",CLASS="A",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/1
  `);
});

// Other EXT-X-DATERANGE tags with the same CLASS
// attribute MUST NOT specify Date Ranges that overlap.
test('#EXT-X-DATERANGE_09', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",DURATION=60.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/1
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:55:00Z",DURATION=61.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/2
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:56:00Z",DURATION=60.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/3
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",DURATION=60.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/1
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:55:00Z",DURATION=60.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/2
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:56:00Z",DURATION=60.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/3
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",DURATION=60.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/1
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:55:00Z",DURATION=61.0,ID="ads",CLASS="B"
    #EXTINF:10,
    http://example.com/2
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:56:00Z",DURATION=60.0,ID="ads",CLASS="A"
    #EXTINF:10,
    http://example.com/3
  `);
});

// An EXT-X-DATERANGE tag with an END-ON-NEXT=YES attribute MUST NOT
// contain DURATION or END-DATE attributes.
test('#EXT-X-DATERANGE_11', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",END-DATE="2010-02-19T14:55:00Z",ID="ads",CLASS="A",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/1
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",DURATION=120.0,ID="ads",CLASS="A",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads",CLASS="A",END-ON-NEXT=YES
    #EXTINF:10,
    http://example.com/1
  `);
});

// If a Playlist contains an EXT-X-DATERANGE tag, it MUST also contain
// at least one EXT-X-PROGRAM-DATE-TIME tag.
test('#EXT-X-DATERANGE_12', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads"
    #EXTINF:10,
    http://example.com/1
  `);
});

// If a Date Range contains both a DURATION attribute and an END-DATE
// attribute, the value of the END-DATE attribute MUST be equal to the
// value of the START-DATE attribute plus the value of the DURATION
// attribute.
test('#EXT-X-DATERANGE_13', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads",DURATION=60.0,END-DATE="2010-02-19T14:56:00Z"
    #EXTINF:10,
    http://example.com/1
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z
    #EXT-X-DATERANGE:START-DATE="2010-02-19T14:54:00Z",ID="ads",DURATION=60.0,END-DATE="2010-02-19T14:55:00Z"
    #EXTINF:10,
    http://example.com/1
  `);
});
