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
    markers: [{
      type: 'RAW',
      tagName: 'EXT-X-SCTE35',
      value: 'TYPE=0x34,DURATION=15.0,CUE-OUT=YES,UPID="0x08:0x9425BC",CUE=”/DA0AAAA+…AAg+2UBNAAANvrtoQ==”,ID=”pIViS5”'
    }]
  }));
  segments.push(new Segment({
    uri: '3.ts',
    duration: 7,
    title: '',
    mediaSequenceNumber: 2,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: '4.ts',
    duration: 8.008,
    title: '',
    mediaSequenceNumber: 3,
    discontinuitySequence: 0,
    markers: [{
      type: 'RAW',
      tagName: 'EXT-X-SCTE35',
      value: 'TYPE=0x35,CUE-IN=YES,CUE=”/DA0AAAA+…AAg+2UBNAAANvrtoQ==”,ID=”f6UrRd”'
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
