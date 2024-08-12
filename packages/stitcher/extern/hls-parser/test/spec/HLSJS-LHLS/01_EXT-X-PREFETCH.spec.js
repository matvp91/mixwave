const test = require("ava");
const utils = require("../../helpers/utils");
const HLS = require("../../..");

test("#EXT-X-PREFETCH_01", t => {
  utils.bothPass(
    t,
    `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 0
    #EXT-X-DISCONTINUITY-SEQUENCE: 0
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
    #EXTINF:2.000
    https://foo.com/bar/0.ts
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts

    #EXT-X-PREFETCH:https://foo.com/bar/2.ts
    #EXT-X-PREFETCH:https://foo.com/bar/3.ts
  `
  );
});

test("#EXT-X-PREFETCH_02", t => {
  const parsed = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 0
    #EXT-X-DISCONTINUITY-SEQUENCE: 0
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
    #EXTINF:2.000
    https://foo.com/bar/0.ts
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts

    #EXT-X-PREFETCH:https://foo.com/bar/2.ts
    #EXT-X-PREFETCH:https://foo.com/bar/3.ts
  `);
  const {prefetchSegments} = parsed;

  t.is(prefetchSegments.length, 2);
  t.is(prefetchSegments[0].uri, "https://foo.com/bar/2.ts");
  t.is(prefetchSegments[1].uri, "https://foo.com/bar/3.ts");

  const stringified = HLS.stringify(parsed);

  t.true(stringified.includes('#EXT-X-PREFETCH:https://foo.com/bar/2.ts'));
  t.true(stringified.includes('#EXT-X-PREFETCH:https://foo.com/bar/3.ts'));
});

// If delivering a low-latency stream, the server must deliver at least one
// prefetch segment, but no more than two.
test("#EXT-X-PREFETCH_03", t => {
  const parsed = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 0
    #EXT-X-DISCONTINUITY-SEQUENCE: 0
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
    #EXTINF:2.000
    https://foo.com/bar/0.ts
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts

    #EXT-X-PREFETCH:https://foo.com/bar/2.ts
    #EXT-X-PREFETCH:https://foo.com/bar/3.ts
    #EXT-X-PREFETCH:https://foo.com/bar/4.ts
  `);
  const {prefetchSegments} = parsed;
  t.is(prefetchSegments.length, 3);

  try {
    HLS.stringify(parsed);
    t.fail('The server must deliver no more than two prefetch segments');
  } catch {
    t.pass();
  }
});

// These segments must appear after all complete segments.
test("#EXT-X-PREFETCH_04", t => {
  try {
    HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:2
      #EXT-X-MEDIA-SEQUENCE: 0
      #EXT-X-DISCONTINUITY-SEQUENCE: 0
      #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
      #EXTINF:2.000
      https://foo.com/bar/0.ts
      #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
      #EXTINF:2.000
      https://foo.com/bar/1.ts

      #EXT-X-PREFETCH:https://foo.com/bar/2.ts
      #EXT-X-PREFETCH:https://foo.com/bar/3.ts

      #EXTINF:2.000
      https://foo.com/bar/4.ts
    `);
    t.fail('Prefetch segments must appear after all complete segments');
  } catch {
    t.pass();
  }
});

// A prefetch segment's Discontinuity Sequence Number is the value of the
// EXT-X-DISCONTINUITY-SEQUENCE tag (or zero if none) plus the number of
// EXT-X-DISCONTINUITY and EXT-X-PREFETCH-DISCONTINUITY tags in the Playlist
// preceding the URI line of the segment.
test("#EXT-X-PREFETCH_05", t => {
  const parsed = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 0
    #EXT-X-DISCONTINUITY-SEQUENCE: 100
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
    #EXTINF:2.000
    https://foo.com/bar/0.ts
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts
    #EXT-X-DISCONTINUITY
    #EXTINF:2.000
    https://foo.com/bar/1.ts

    #EXT-X-PREFETCH-DISCONTINUITY
    #EXT-X-PREFETCH:https://foo.com/bar/5.ts
    #EXT-X-PREFETCH:https://foo.com/bar/6.ts
  `);
  const {prefetchSegments} = parsed;
  t.is(prefetchSegments[1].discontinuitySequence, 102);
});

// If a prefetch segment is the first segment in a manifest, its Media Sequence
// Number is either 0, or declared in the Playlist.
// The Media Sequence Number of every other prefetch segment is equal to the
// Media Sequence Number of the complete segment or prefetch segment that
// precedes it plus one.
test("#EXT-X-PREFETCH_06", t => {
  let parsed;
  parsed = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2

    #EXT-X-PREFETCH:https://foo.com/bar/5.ts
    #EXT-X-PREFETCH:https://foo.com/bar/6.ts
  `);
  t.is(parsed.prefetchSegments[0].mediaSequenceNumber, 0);
  t.is(parsed.prefetchSegments[1].mediaSequenceNumber, 1);

  parsed = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 100

    #EXT-X-PREFETCH:https://foo.com/bar/5.ts
    #EXT-X-PREFETCH:https://foo.com/bar/6.ts
  `);
  t.is(parsed.prefetchSegments[0].mediaSequenceNumber, 100);
  t.is(parsed.prefetchSegments[1].mediaSequenceNumber, 101);
});

// A prefetch segment must not be advertised with an EXTINF tag. The duration of
// a prefetch segment must be equal to or less than what is specified by the
// EXT-X-TARGETDURATION tag.
test("#EXT-X-PREFETCH_07", t => {
  try {
    HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:2

      #EXTINF:2.000
      #EXT-X-PREFETCH:https://foo.com/bar/5.ts
      #EXTINF:2.000
      #EXT-X-PREFETCH:https://foo.com/bar/6.ts
    `);
    t.fail('A prefetch segment must not be advertised with an EXTINF tag');
  } catch {
    t.pass();
  }
});

// A prefetch segment must not be advertised with an EXT-X-DISCONTINUITY tag.
// To insert a discontinuity just for prefetch segments, the server must insert
// the EXT-X-PREFETCH-DISCONTINUITY tag before the newest EXT-X-PREFETCH tag of
// the new discontinuous range.
test("#EXT-X-PREFETCH_08", t => {
  try {
    HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:2

      #EXT-X-DISCONTINUITY
      #EXT-X-PREFETCH:https://foo.com/bar/5.ts
      #EXT-X-PREFETCH:https://foo.com/bar/6.ts
    `);
    t.fail('A prefetch segment must not be advertised with an EXT-X-DISCONTINUITY tag');
  } catch {
    t.pass();
  }
});

// Prefetch segments must not be advertised with an EXT-X-MAP tag.
test("#EXT-X-PREFETCH_09", t => {
  try {
    HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:2

      #EXT-X-MAP:URI="http://example.com/map-1"
      #EXT-X-PREFETCH:https://foo.com/bar/5.ts
      #EXT-X-PREFETCH:https://foo.com/bar/6.ts
    `);
    t.fail('Prefetch segments must not be advertised with an EXT-X-MAP tag');
  } catch {
    t.pass();
  }
});

// Prefetch segments may be advertised with an EXT-X-KEY tag. The key itself
// must be complete; the server must not expect the client to progressively stream keys.
test("#EXT-X-PREFETCH_10", t => {
  const parsed = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2

    #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
    #EXT-X-PREFETCH:https://foo.com/bar/5.ts
    #EXT-X-PREFETCH:https://foo.com/bar/6.ts
  `);
  const {prefetchSegments} = parsed;
  t.truthy(prefetchSegments[0].key);
  t.is(prefetchSegments[0].key.uri, 'http://example.com');
  t.truthy(prefetchSegments[1].key);
  t.is(prefetchSegments[1].key.uri, 'http://example.com');
});
