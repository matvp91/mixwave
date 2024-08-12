const {MediaPlaylist, Segment, PartialSegment, MediaInitializationSection, RenditionReport} = require('../../../types');

const playlist = new MediaPlaylist({
  version: 6,
  targetDuration: 4,
  mediaSequenceBase: 266,
  lowLatencyCompatibility: {canBlockReload: true, canSkipUntil: 24, partHoldBack: 1},
  partTargetDuration: 0.33334,
  segments: createSegments(),
  renditionReports: createRenditionReports()
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: 'fileSequence266.mp4',
    duration: 4.00008,
    title: '',
    mediaSequenceNumber: 266,
    discontinuitySequence: 0,
    programDateTime: new Date('2019-02-14T02:13:36.106Z'),
    map: new MediaInitializationSection({uri: 'init.mp4'})
  }));
  segments.push(new Segment({
    uri: 'fileSequence267.mp4',
    duration: 4.00008,
    title: '',
    mediaSequenceNumber: 267,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: 'fileSequence268.mp4',
    duration: 4.00008,
    title: '',
    mediaSequenceNumber: 268,
    discontinuitySequence: 0
  }));
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
    parts: createParts1()
  }));
  segments.push(new Segment({
    uri: 'fileSequence272.mp4',
    duration: 4.00008,
    title: '',
    mediaSequenceNumber: 272,
    discontinuitySequence: 0,
    programDateTime: new Date('2019-02-14T02:14:00.106Z'),
    parts: createParts2()
  }));
  segments.push(new Segment({
    mediaSequenceNumber: 273,
    parts: createParts3()
  }));
  return segments;
}

function createRenditionReports() {
  const reports = [];
  reports.push(new RenditionReport({
    uri: '../1M/waitForMSN.php',
    lastMSN: 273,
    lastPart: 2
  }));
  reports.push(new RenditionReport({
    uri: '../4M/waitForMSN.php',
    lastMSN: 273,
    lastPart: 1
  }));
  return reports;
}

function createParts1() {
  const parts = [];
  for (let i = 0; i < 12; i++) {
    parts.push(new PartialSegment({
      uri: `filePart271.${i}.mp4`,
      duration: 0.33334,
      independent: (i === 4 || i === 8)
    }));
  }
  return parts;
}

function createParts2() {
  const parts = [];
  const aCode = 'a'.charCodeAt(0);
  for (let i = 0; i < 12; i++) {
    parts.push(new PartialSegment({
      uri: `filePart272.${String.fromCharCode(aCode + i)}.mp4`,
      duration: 0.33334,
      independent: (i === 5)
    }));
  }
  return parts;
}

function createParts3() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(new PartialSegment({
      uri: `filePart273.${i}.mp4`,
      duration: 0.33334,
      independent: (i === 0),
      hint: (i === 3)
    }));
  }
  return parts;
}

module.exports = playlist;
