const {MediaPlaylist, Segment, DateRange} = require('../../../types');
const utils = require('../../../utils');

const playlist = new MediaPlaylist({
  version: 3,
  targetDuration: 30,
  segments: createSegments()
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: 'http://media.example.com/01.ts',
    duration: 30,
    title: '',
    mediaSequenceNumber: 0,
    discontinuitySequence: 0,
    programDateTime: new Date('2014-03-05T11:14:00Z')
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/02.ts',
    duration: 30,
    title: '',
    mediaSequenceNumber: 1,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'http://ads.example.com/ad-01.ts',
    duration: 30,
    title: '',
    mediaSequenceNumber: 2,
    discontinuitySequence: 0,
    dateRange: new DateRange({
      id: 'splice-6FFFFFF0',
      start: new Date('2014-03-05T11:15:00Z'),
      plannedDuration: 59.993,
      attributes: {
        'SCTE35-OUT': utils.hexToByteSequence('0xFC002F0000000000FF000014056FFFFFF000E011622DCAFF000052636200000000000A0008029896F50000008700000000')
      }
    })
  }));
  segments.push(new Segment({
    uri: 'http://ads.example.com/ad-02.ts',
    duration: 30,
    title: '',
    mediaSequenceNumber: 3,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/03.ts',
    duration: 30,
    title: '',
    mediaSequenceNumber: 4,
    discontinuitySequence: 0,
    dateRange: new DateRange({
      id: 'splice-6FFFFFF0',
      duration: 59.993,
      attributes: {
        'SCTE35-IN': utils.hexToByteSequence('0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000')
      }
    })
  }));
  segments.push(new Segment({
    uri: 'http://media.example.com/04.ts',
    duration: 3.003,
    title: '',
    mediaSequenceNumber: 5,
    discontinuitySequence: 0
  }));
  return segments;
}

module.exports = playlist;
