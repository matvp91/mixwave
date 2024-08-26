const {MediaPlaylist, Segment, PartialSegment} = require('../../../types');

const playlist = new MediaPlaylist({
  version: 9,
  targetDuration: 4,
  mediaSequenceBase: 266,
  lowLatencyCompatibility: {canBlockReload: true, canSkipUntil: 24.0, partHoldBack: 1.02},
  partTargetDuration: 1.02,
  skip: 3,
  segments: createSegments()
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: 'fileSequence269.mp4',
    duration: 4.00008,
    title: '',
    mediaSequenceNumber: 269,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'fileSequence270.mp4',
    duration: 4.00008,
    title: '',
    mediaSequenceNumber: 270,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'fileSequence271.mp4',
    duration: 4.00008,
    title: '',
    mediaSequenceNumber: 271,
    discontinuitySequence: 0,
    parts: createParts()
  }));
  segments.push(new Segment({
    mediaSequenceNumber: 272,
    parts: [
      new PartialSegment({
        uri: 'fileSequence272.mp4',
        duration: 1.02,
        byterange: {offset: 0, length: 21000}
      }),
      new PartialSegment({
        uri: 'fileSequence272.mp4',
        byterange: {offset: 21000},
        hint: true
      })
    ]
  }));
  return segments;
}

function createParts() {
  const parts = [];
  parts.push(new PartialSegment({
    uri: 'fileSequence271.mp4',
    duration: 1.02,
    byterange: {offset: 0, length: 20000}
  }));
  parts.push(new PartialSegment({
    uri: 'fileSequence271.mp4',
    duration: 1.02,
    byterange: {offset: 20000, length: 23000}
  }));
  parts.push(new PartialSegment({
    uri: 'fileSequence271.mp4',
    duration: 1.02,
    byterange: {offset: 43000, length: 18000}
  }));
  parts.push(new PartialSegment({
    uri: 'fileSequence271.mp4',
    duration: 1.02,
    byterange: {offset: 61000, length: 19000}
  }));
  return parts;
}

module.exports = playlist;
