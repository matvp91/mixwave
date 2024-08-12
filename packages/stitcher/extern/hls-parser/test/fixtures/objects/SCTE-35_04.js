const {MediaPlaylist, Segment} = require('../../../types');

const playlist = new MediaPlaylist({
  playlistType: 'VOD',
  version: 3,
  targetDuration: 8,
  segments: createSegments(),
  endlist: true
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: '1.ts',
    duration: 8.008,
    title: '',
    mediaSequenceNumber: 0,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: '2.ts',
    duration: 8,
    title: '',
    mediaSequenceNumber: 1,
    discontinuitySequence: 0,
    markers: [
      {
        type: 'RAW',
        tagName: 'EXT-OATCLS-SCTE35',
        value: '/DA0AAAAAAAAAAAABQb+ADAQ6QAeAhxDVUVJQAAAO3/PAAEUrEoICAAAAAAg+2UBNAAANvrtoQ=='
      },
      {
        type: 'RAW',
        tagName: 'EXT-X-ASSET',
        value: 'CAID=0x0000000020FB6501'
      },
      {
        type: 'OUT',
        duration: 15.0
      }
    ]
  }));
  segments.push(new Segment({
    uri: '3.ts',
    duration: 7,
    title: '',
    mediaSequenceNumber: 2,
    discontinuitySequence: 0,
    markers: [{
      type: 'RAW',
      tagName: 'EXT-X-CUE-OUT-CONT',
      value: 'ElapsedTime=5.939,Duration=25.0,SCTE35=/DA0AAAA+…AAg+2UBNAAANvrtoQ=='
    }]
  }));
  segments.push(new Segment({
    uri: '4.ts',
    duration: 8.008,
    title: '',
    mediaSequenceNumber: 3,
    discontinuitySequence: 0,
    markers: [{
      type: 'IN'
    }]
  }));
  segments.push(new Segment({
    uri: '5.ts',
    duration: 8.008,
    title: '',
    mediaSequenceNumber: 4,
    discontinuitySequence: 0
  }));
  return segments;
}

module.exports = playlist;
