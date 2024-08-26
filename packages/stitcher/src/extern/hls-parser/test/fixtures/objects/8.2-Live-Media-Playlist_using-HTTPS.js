const {MediaPlaylist, Segment} = require('../../../types');

const mediaSequenceBase = 2680;

const playlist = new MediaPlaylist({
  version: 3,
  targetDuration: 8,
  mediaSequenceBase,
  segments: createSegments()
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: 'https://priv.example.com/fileSequence2680.ts',
    duration: 7.975,
    title: '',
    mediaSequenceNumber: mediaSequenceBase + 0,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'https://priv.example.com/fileSequence2681.ts',
    duration: 7.941,
    title: '',
    mediaSequenceNumber: mediaSequenceBase + 1,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'https://priv.example.com/fileSequence2682.ts',
    duration: 7.975,
    title: '',
    mediaSequenceNumber: mediaSequenceBase + 2,
    discontinuitySequence: 0
  }));
  return segments;
}

module.exports = playlist;
