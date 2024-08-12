const test = require('ava');
const fixtures = require('../helpers/fixtures');
const utils = require('../helpers/utils');
const HLS = require('../..');

HLS.setOptions({strictMode: true});

for (const {name, m3u8, object} of fixtures) {
  test(name, t => {
    const result = HLS.stringify(object);
    t.is(result, utils.stripCommentsAndEmptyLines(m3u8));
  });
}

test('stringify.postProcess.segment.add', t => {
  const obj = HLS.parse(`
  #EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-TARGETDURATION:6
  #EXTINF:6.006,
  http://media.example.com/01.ts
  #EXTINF:6.006,
  http://media.example.com/02.ts
  #EXTINF:6.006,
  http://ads.example.com/ad-01.ts
  #EXTINF:6.006,
  http://ads.example.com/ad-02.ts
  #EXTINF:6.006,
  http://media.example.com/03.ts
  #EXTINF:3.003,
  http://media.example.com/04.ts
  `);
  const expected = `
  #EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-TARGETDURATION:6
  #EXT-X-MY-PROGRAM-DATE-TIME:2014-03-05T11:14:00.000Z
  #EXTINF:6.006,
  http://media.example.com/01.ts
  #EXT-X-MY-PROGRAM-DATE-TIME:2014-03-05T11:14:06.006Z
  #EXTINF:6.006,
  http://media.example.com/02.ts
  #EXT-X-MY-PROGRAM-DATE-TIME:2014-03-05T11:14:12.012Z
  #EXTINF:6.006,
  http://ads.example.com/ad-01.ts
  #EXT-X-MY-PROGRAM-DATE-TIME:2014-03-05T11:14:18.018Z
  #EXTINF:6.006,
  http://ads.example.com/ad-02.ts
  #EXT-X-MY-PROGRAM-DATE-TIME:2014-03-05T11:14:24.024Z
  #EXTINF:6.006,
  http://media.example.com/03.ts
  #EXT-X-MY-PROGRAM-DATE-TIME:2014-03-05T11:14:30.030Z
  #EXTINF:3.003,
  http://media.example.com/04.ts
  `;
  let time = new Date('2014-03-05T11:14:00.000Z').getTime();
  const segmentProcessor = (lines, start, end, segment) => {
    let hasPdt = false;
    for (let i = start; i <= end; i++) {
      if (lines[i].startsWith('#EXT-X-PROGRAM-DATE-TIME')) {
        hasPdt = true;
        break;
      }
    }
    if (!hasPdt) {
      lines.splice(start, 0, `#EXT-X-MY-PROGRAM-DATE-TIME:${new Date(Math.round(time)).toISOString()}`);
    }
    time += segment.duration * 1000;
  };
  const result = HLS.stringify(obj, {segmentProcessor});
  t.is(result, utils.stripCommentsAndEmptyLines(expected));
});

test('stringify.postProcess.segment.delete', t => {
  const obj = HLS.parse(`
  #EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-TARGETDURATION:6
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:00.000Z
  #EXTINF:6.006,
  http://media.example.com/01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:06.006Z
  #EXTINF:6.006,
  http://media.example.com/02.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:12.012Z
  #EXT-X-DATERANGE:ID="splice-6FFFFFF0",START-DATE="2014-03-05T11:15:00.000Z",PLANNED-DURATION=59.993,SCTE35-OUT=0xFC002F0000000000FF000014056FFFFFF000E011622DCAFF000052636200000000000A0008029896F50000008700000000
  #EXTINF:6.006,
  http://ads.example.com/ad-01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:18.018Z
  #EXTINF:6.006,
  http://ads.example.com/ad-02.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:24.024Z
  #EXT-X-DATERANGE:ID="splice-6FFFFFF0",DURATION=59.993,SCTE35-IN=0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000
  #EXTINF:6.006,
  http://media.example.com/03.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:30.030Z
  #EXTINF:3.003,
  http://media.example.com/04.ts
  `);
  const expected = `
  #EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-TARGETDURATION:6
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:00.000Z
  #EXTINF:6.006,
  http://media.example.com/01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:06.006Z
  #EXTINF:6.006,
  http://media.example.com/02.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:12.012Z
  #EXTINF:6.006,
  http://ads.example.com/ad-01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:18.018Z
  #EXTINF:6.006,
  http://ads.example.com/ad-02.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:24.024Z
  #EXTINF:6.006,
  http://media.example.com/03.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:30.030Z
  #EXTINF:3.003,
  http://media.example.com/04.ts
  `;
  const segmentProcessor = (lines, start, end) => {
    for (let i = start; i <= end; i++) {
      const line = lines[i];
      if (line.startsWith('#EXT-X-DATERANGE')) {
        lines[i] = '';
      }
    }
  };
  const result = HLS.stringify(obj, {segmentProcessor});
  t.is(result, utils.stripCommentsAndEmptyLines(expected));
});

test('stringify.postProcess.segment.update', t => {
  const obj = HLS.parse(`
  #EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-TARGETDURATION:6
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:00.000Z
  #EXTINF:6.006,
  http://media.example.com/01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:06.006Z
  #EXTINF:6.006,
  http://media.example.com/02.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:12.012Z
  #EXT-X-DATERANGE:ID="splice-6FFFFFF0",START-DATE="2014-03-05T11:15:00.000Z",PLANNED-DURATION=59.993,SCTE35-OUT=0xFC002F0000000000FF000014056FFFFFF000E011622DCAFF000052636200000000000A0008029896F50000008700000000
  #EXTINF:6.006,
  http://ads.example.com/ad-01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:18.018Z
  #EXTINF:6.006,
  http://ads.example.com/ad-02.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:24.024Z
  #EXT-X-DATERANGE:ID="splice-6FFFFFF0",DURATION=59.993,SCTE35-IN=0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000
  #EXTINF:6.006,
  http://media.example.com/03.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:30.030Z
  #EXTINF:3.003,
  http://media.example.com/04.ts
  `);
  const expected = `
  #EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-TARGETDURATION:6
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:00.000Z
  #EXTINF:6.006,
  http://media.example.com/01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:06.006Z
  #EXTINF:6.006,
  http://media.example.com/02.ts
  <b>#EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:12.012Z
  #EXT-X-DATERANGE:ID="splice-6FFFFFF0",START-DATE="2014-03-05T11:15:00.000Z",PLANNED-DURATION=59.993,SCTE35-OUT=0xFC002F0000000000FF000014056FFFFFF000E011622DCAFF000052636200000000000A0008029896F50000008700000000
  #EXTINF:6.006,
  http://ads.example.com/ad-01.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:18.018Z
  #EXTINF:6.006,
  http://ads.example.com/ad-02.ts</b>
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:24.024Z
  #EXT-X-DATERANGE:ID="splice-6FFFFFF0",DURATION=59.993,SCTE35-IN=0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000
  #EXTINF:6.006,
  http://media.example.com/03.ts
  #EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:30.030Z
  #EXTINF:3.003,
  http://media.example.com/04.ts
  `;
  const segmentProcessor = (lines, start, end) => {
    for (let i = start; i <= end; i++) {
      const line = lines[i];
      if (line.startsWith('#EXT-X-DATERANGE')) {
        if (line.includes('PLANNED-DURATION')) {
          lines[start] = `<b>${lines[start]}`;
        } else if (start > 0) {
          lines[start - 1] = `${lines[start - 1]}</b>`;
        }
      }
    }
  };
  const result = HLS.stringify(obj, {segmentProcessor});
  t.is(result, utils.stripCommentsAndEmptyLines(expected));
});

test('stringify.postProcess.variant.update', t => {
  const obj = HLS.parse(`
  #EXTM3U
  #EXT-X-STREAM-INF:BANDWIDTH=1280000
  http://example.com/low.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=2560000
  http://example.com/mid.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=7680000
  http://example.com/hi.m3u8
`);
  const expected = `
  #EXTM3U
  #EXT-X-STREAM-INF:BANDWIDTH=1280000,MY-RESOLUTION=1280x720
  http://example.com/low.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=2560000,MY-RESOLUTION=1920x1080
  http://example.com/mid.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=7680000,MY-RESOLUTION=3840x2160
  http://example.com/hi.m3u8
`;
  const variantProcessor = (lines, start, end, {bandwidth}) => {
    for (let i = start; i <= end; i++) {
      const line = lines[i];
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        let resolution = '640x360';
        if (bandwidth >= 1000000 && bandwidth < 2000000) {
          resolution = '1280x720';
        } else if (bandwidth >= 2000000 && bandwidth < 3000000) {
          resolution = '1920x1080';
        } else if (bandwidth >= 3000000) {
          resolution = '3840x2160';
        }
        lines[i] = `${line},MY-RESOLUTION=${resolution}`;
      }
    }
  };
  const result = HLS.stringify(obj, {variantProcessor});
  t.is(result, utils.stripCommentsAndEmptyLines(expected));
});
