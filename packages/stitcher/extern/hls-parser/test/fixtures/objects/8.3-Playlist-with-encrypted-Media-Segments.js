const {MediaPlaylist, Segment, Key} = require('../../../types');

const mediaSequenceBase = 7794;

const key1 = new Key({method: 'AES-128', uri: 'https://priv.example.com/key.php?r=52'});
const key2 = new Key({method: 'AES-128', uri: 'https://priv.example.com/key.php?r=53'});

const playlist = new MediaPlaylist({
  version: 3,
  targetDuration: 15,
  mediaSequenceBase,
  segments: createSegments()
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: 'http://media.example.com/fileSequence52-A.ts',
    duration: 2.833,
    title: '',
    mediaSequenceNumber: mediaSequenceBase + 0,
    discontinuitySequence: 0,
    key: key1
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/fileSequence52-B.ts',
    duration: 15.0,
    title: '',
    mediaSequenceNumber: mediaSequenceBase + 1,
    discontinuitySequence: 0,
    key: key1
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/fileSequence52-C.ts',
    duration: 13.333,
    title: '',
    mediaSequenceNumber: mediaSequenceBase + 2,
    discontinuitySequence: 0,
    key: key1
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/fileSequence53-A.ts',
    duration: 15.0,
    title: '',
    mediaSequenceNumber: mediaSequenceBase + 3,
    discontinuitySequence: 0,
    key: key2
  }));
  return segments;
}

module.exports = playlist;
