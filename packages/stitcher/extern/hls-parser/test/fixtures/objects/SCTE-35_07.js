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
      start: new Date('2023-10-09T06:16:00.820Z'),
      plannedDuration: 59.993,
      attributes: {
        'SCTE35-OUT': utils.hexToByteSequence('0xFC30250001D1F7E25300FFF0140565239AA07FEFFE015C3F90FE00526362000101010000A7C1792D')
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
      start: new Date('2023-10-09T06:16:00.820Z'),
      end: new Date('2023-10-09T06:17:01.514Z'),
      duration: 60.694
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
