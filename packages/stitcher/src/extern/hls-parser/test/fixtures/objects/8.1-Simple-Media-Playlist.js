const {MediaPlaylist, Segment} = require('../../../types');

const playlist = new MediaPlaylist({
  version: 3,
  targetDuration: 10,
  segments: createSegments(),
  endlist: true
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: 'http://media.example.com/first.ts',
    duration: 9.009,
    title: '',
    mediaSequenceNumber: 0,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/second.ts',
    duration: 9.009,
    title: '',
    mediaSequenceNumber: 1,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/third.ts',
    duration: 3.003,
    title: '',
    mediaSequenceNumber: 2,
    discontinuitySequence: 0
  }));
  return segments;
}

module.exports = playlist;
