const test = require('ava');
const fixtures = require('../helpers/fixtures');
const HLS = require('../..');

HLS.setOptions({strictMode: true});

const {Playlist} = HLS.types;

for (const {name, m3u8, object} of fixtures) {
  test(name, t => {
    const result = HLS.parse(m3u8);
    if (result.source === m3u8 && deepEqual(t, result, object)) {
      t.pass();
    }
  });
}

function buildMessage(propName, actual, expected) {
  if (actual && typeof actual === 'object') {
    actual = JSON.parse(actual);
  }
  if (expected && typeof expected === 'object') {
    expected = JSON.parse(expected);
  }
  return `
${propName} does not match.
expected:
${expected}
actual:
${actual}
`;
}

function deepEqual(t, actual, expected) {
  if (!expected) {
    return;
  }
  let errorMessage;
  if (actual instanceof Playlist === false) {
    return t.fail('The result is not an instance of Playlist');
  }
  if (actual.isMasterPlaylist !== expected.isMasterPlaylist) {
    return t.fail(buildMessage('Playlist.isMasterPlaylist', actual.isMasterPlaylist, expected.isMasterPlaylist));
  }
  if (expected.uri) {
    if (!actual.uri || actual.uri.href !== expected.uri.href) {
      return t.fail(buildMessage('Playlist.uri', actual.uri, expected.uri));
    }
  }
  if (actual.version !== expected.version) {
    return t.fail(buildMessage('Playlist.version', actual.version, expected.version));
  }
  if (actual.independentSegments !== expected.independentSegments) {
    return t.fail(buildMessage('Playlist.independentSegments', actual.independentSegments, expected.independentSegments));
  }
  if (actual.offset !== expected.offset) {
    return t.fail(buildMessage('Playlist.offset', actual.offset, expected.offset));
  }
  if (expected.isMasterPlaylist) {
    // MasterPlaylist
    if (expected.variants) {
      if (!actual.variants || actual.variants.length !== expected.variants.length) {
        return t.fail(buildMessage('Playlist.variants', actual.variants, expected.variants));
      }
      for (const [index, actualVariant] of actual.variants.entries()) {
        if (errorMessage = deepEqualVariant(t, actualVariant, expected.variants[index])) {
          return t.fail(errorMessage);
        }
      }
    }
    if (actual.currentVariant !== expected.currentVariant) {
      return t.fail(buildMessage('MasterPlaylist.currentVariant', actual.currentVariant, expected.currentVariant));
    }

    if (expected.sessionDataList) {
      if (!actual.sessionDataList || actual.sessionDataList.length !== expected.sessionDataList.length) {
        return t.fail(buildMessage('MasterPlaylist.sessionDataList', actual.sessionDataList, expected.sessionDataList));
      }
      for (const [index, actualSessionData] of actual.sessionDataList.entries()) {
        if (errorMessage = deepEqualSessionData(t, actualSessionData, expected.sessionDataList[index])) {
          return t.fail(errorMessage);
        }
      }
    }
    if (expected.sessionKeyList) {
      if (!actual.sessionKeyList || actual.sessionKeyList.length !== expected.sessionKeyList.length) {
        return t.fail(buildMessage('MasterPlaylist.sessionKeyList', actual.sessionKeyList, expected.sessionKeyList));
      }
      for (const [index, actualSessionKey] of actual.sessionKeyList.entries()) {
        if (errorMessage = deepEqualKey(t, actualSessionKey, expected.sessionKeyList[index])) {
          return t.fail(errorMessage);
        }
      }
    }
  } else {
    // MediaPlaylist
    if (actual.targetDuration !== expected.targetDuration) {
      return t.fail(buildMessage('MediaPlaylist.targetDuration', actual.targetDuration, expected.targetDuration));
    }
    if (actual.mediaSequenceBase !== expected.mediaSequenceBase) {
      return t.fail(buildMessage('MediaPlaylist.mediaSequenceBase', actual.mediaSequenceBase, expected.mediaSequenceBase));
    }
    if (actual.discontinuitySequenceBase !== expected.discontinuitySequenceBase) {
      return t.fail(buildMessage('MediaPlaylist.discontinuitySequenceBase', actual.discontinuitySequenceBase, expected.discontinuitySequenceBase));
    }
    if (actual.endlist !== expected.endlist) {
      return t.fail(buildMessage('MediaPlaylist.endlist', actual.endlist, expected.endlist));
    }
    if (actual.playlistType !== expected.playlistType) {
      return t.fail(buildMessage('MediaPlaylist.playlistType', actual.playlistType, expected.playlistType));
    }
    if (actual.isIFrame !== expected.isIFrame) {
      return t.fail(buildMessage('MediaPlaylist.isIFrame', actual.isIFrame, expected.isIFrame));
    }
    if (expected.segments) {
      if (!actual.segments || actual.segments.length !== expected.segments.length) {
        return t.fail(buildMessage('MediaPlaylist.segments', actual.segments, expected.segments));
      }
      for (const [index, actualSegment] of actual.segments.entries()) {
        if (errorMessage = deepEqualSegment(t, actualSegment, expected.segments[index])) {
          return t.fail(errorMessage);
        }
      }
    }
    if (actual.hash !== expected.hash) {
      return t.fail(buildMessage('MediaPlaylist.hash', actual.hash, expected.hash));
    }
  }
  return true;
}

function deepEqualVariant(t, actual, expected) {
  if (!expected) {
    return;
  }
  let errorMessage;
  if (expected.uri) {
    if (!actual.uri || actual.uri.href !== expected.uri.href) {
      return t.fail(buildMessage('Variant.uri', actual.uri, expected.uri));
    }
  }
  if (actual.isIFrameOnly !== expected.isIFrameOnly) {
    return t.fail(buildMessage('Variant.isIFrameOnly', actual.isIFrameOnly, expected.isIFrameOnly));
  }
  if (actual.bandwidth !== expected.bandwidth) {
    return t.fail(buildMessage('Variant.bandwidth', actual.bandwidth, expected.bandwidth));
  }
  if (actual.averageBandwidth !== expected.averageBandwidth) {
    return t.fail(buildMessage('Variant.averageBandwidth', actual.averageBandwidth, expected.averageBandwidth));
  }
  if (actual.codecs !== expected.codecs) {
    return t.fail(buildMessage('Variant.codecs', actual.codecs, expected.codecs));
  }
  if (expected.resolution) {
    if (!actual.resolution || actual.resolution.width !== expected.resolution.width || actual.resolution.height !== expected.resolution.height) {
      return t.fail(buildMessage('Variant.resolution', actual.resolution, expected.resolution));
    }
  }
  if (actual.frameRate !== expected.frameRate) {
    return t.fail(buildMessage('Variant.frameRate', actual.frameRate, expected.frameRate));
  }
  if (actual.hdcpLevel !== expected.hdcpLevel) {
    return t.fail(buildMessage('Variant.hdcpLevel', actual.hdcpLevel, expected.hdcpLevel));
  }
  if (expected.audio) {
    if (!actual.audio || actual.audio.length !== expected.audio.length) {
      return t.fail(buildMessage('Variant.audio', actual.audio, expected.audio));
    }
    for (const [index, actualRendition] of actual.audio.entries()) {
      if (errorMessage = deepEqualRendition(t, actualRendition, expected.audio[index])) {
        return t.fail(errorMessage);
      }
    }
  }
  if (expected.video) {
    if (!actual.video || actual.video.length !== expected.video.length) {
      return t.fail(buildMessage('Variant.video', actual.video, expected.video));
    }
    for (const [index, actualRendition] of actual.video.entries()) {
      if (errorMessage = deepEqualRendition(t, actualRendition, expected.video[index])) {
        return t.fail(errorMessage);
      }
    }
  }
  if (expected.subtitles) {
    if (!actual.subtitles || actual.subtitles.length !== expected.subtitles.length) {
      return t.fail(buildMessage('Variant.subtitles', actual.subtitles, expected.subtitles));
    }
    for (const [index, actualRendition] of actual.subtitles.entries()) {
      if (errorMessage = deepEqualRendition(t, actualRendition, expected.subtitles[index])) {
        return t.fail(errorMessage);
      }
    }
  }
  if (expected.closedCaptions) {
    if (!actual.closedCaptions || actual.closedCaptions.length !== expected.closedCaptions.length) {
      return t.fail(buildMessage('Variant.closedCaptions', actual.closedCaptions, expected.closedCaptions));
    }
    for (const [index, actualRendition] of actual.closedCaptions.entries()) {
      if (errorMessage = deepEqualRendition(t, actualRendition, expected.closedCaptions[index])) {
        return t.fail(errorMessage);
      }
    }
  }
  if (expected.currentRenditions) {
    const expectedCurrentRenditions = expected.currentRenditions;
    const actualCurrentRenditions = actual.currentRenditions;
    for (const key of Object.keys(expectedCurrentRenditions)) {
      if (actualCurrentRenditions[key] !== expectedCurrentRenditions[key]) {
        return t.fail(buildMessage('Variant.currentRenditions', actualCurrentRenditions[key], expectedCurrentRenditions[key]));
      }
    }
  }
}

function deepEqualSessionData(t, actual, expected) {
  if (!expected) {
    return;
  }
  if (actual.id !== expected.id) {
    return t.fail(buildMessage('SessionData.id', actual.id, expected.id));
  }
  if (actual.value !== expected.value) {
    return t.fail(buildMessage('SessionData.value', actual.value, expected.value));
  }
  if (expected.uri) {
    if (!actual.uri || actual.uri.href !== expected.uri.href) {
      return t.fail(buildMessage('SessionData.uri', actual.uri, expected.uri));
    }
  }
  if (actual.language !== expected.language) {
    return t.fail(buildMessage('SessionData.language', actual.language, expected.language));
  }
}

function deepEqualKey(t, actual, expected) {
  if (!expected) {
    return;
  }
  if (actual.method !== expected.method) {
    return t.fail(buildMessage('Key.method', actual.method, expected.method));
  }
  if (expected.uri) {
    if (!actual.uri || actual.uri.href !== expected.uri.href) {
      return t.fail(buildMessage('Key.uri', actual.uri, expected.uri));
    }
  }
  if (expected.iv) {
    if (!actual.iv || actual.iv.length !== expected.iv.length) {
      return t.fail(buildMessage('Key.iv', actual.iv, expected.iv));
    }
    for (let i = 0; i < actual.iv.length; i++) {
      if (actual.iv[i] !== expected.iv[i]) {
        return t.fail(buildMessage('Key.iv', actual.iv, expected.iv));
      }
    }
  }
  if (actual.format !== expected.format) {
    return t.fail(buildMessage('Key.format', actual.format, expected.format));
  }
  if (actual.formatVersion !== expected.formatVersion) {
    return t.fail(buildMessage('Key.formatVersion', actual.formatVersion, expected.formatVersion));
  }
}

function deepEqualSegment(t, actual, expected) {
  if (!expected) {
    return;
  }
  let errorMessage;
  if (expected.uri) {
    if (!actual.uri || actual.uri.href !== expected.uri.href) {
      return t.fail(buildMessage('Segment.uri', actual.uri, expected.uri));
    }
  }
  if (expected.data) {
    if (!actual.data || actual.data.length !== expected.data.length) {
      return t.fail(buildMessage('Segment.data', actual.data, expected.data));
    }
    for (let i = 0; i < actual.data.length; i++) {
      if (actual.data[i] !== expected.data[i]) {
        return t.fail(buildMessage('Segment.data', actual.data, expected.data));
      }
    }
  }
  if (actual.duration !== expected.duration) {
    return t.fail(buildMessage('Segment.duration', actual.duration, expected.duration));
  }
  if (actual.title !== expected.title) {
    return t.fail(buildMessage('Segment.title', actual.title, expected.title));
  }
  if (expected.byterange) {
    if (!actual.byterange || actual.byterange.length !== expected.byterange.length || actual.byterange.offset !== expected.byterange.offset) {
      return t.fail(buildMessage('Segment.byterange', actual.byterange, expected.byterange));
    }
  }
  if (actual.discontinuity !== expected.discontinuity) {
    return t.fail(buildMessage('Segment.discontinuity', actual.discontinuity, expected.discontinuity));
  }
  if (actual.mediaSequenceNumber !== expected.mediaSequenceNumber) {
    return t.fail(buildMessage('Segment.mediaSequenceNumber', actual.mediaSequenceNumber, expected.mediaSequenceNumber));
  }
  if (actual.discontinuitySequence !== expected.discontinuitySequence) {
    return t.fail(buildMessage('Segment.discontinuitySequence', actual.discontinuitySequence, expected.discontinuitySequence));
  }
  if (errorMessage = deepEqualKey(t, actual.key, expected.key)) {
    return t.fail(errorMessage);
  }
  if (errorMessage = deepEqualMap(t, actual.map, expected.map)) {
    return t.fail(errorMessage);
  }
  if (expected.programDateTime) {
    if (!actual.programDateTime || actual.programDateTime.getTime() !== expected.programDateTime.getTime()) {
      return t.fail(buildMessage('Segment.programDateTime', actual.programDateTime, expected.programDateTime));
    }
  }
  if (errorMessage = deepEqualDateRange(t, actual.dateRange, expected.dateRange)) {
    return t.fail(errorMessage);
  }
}

function deepEqualRendition(t, actual, expected) {
  if (!expected) {
    return;
  }
  if (actual.type !== expected.type) {
    return t.fail(buildMessage('Rendition.type', actual.type, expected.type));
  }
  if (expected.uri) {
    if (!actual.uri || actual.uri.href !== expected.uri.href) {
      return t.fail(buildMessage('Rendition.uri', actual.uri, expected.uri));
    }
  }
  if (actual.groupId !== expected.groupId) {
    return t.fail(buildMessage('Rendition.groupId', actual.groupId, expected.groupId));
  }
  if (actual.language !== expected.language) {
    return t.fail(buildMessage('Rendition.language', actual.language, expected.language));
  }
  if (actual.assocLanguage !== expected.assocLanguage) {
    return t.fail(buildMessage('Rendition.assocLanguage', actual.assocLanguage, expected.assocLanguage));
  }
  if (actual.name !== expected.name) {
    return t.fail(buildMessage('Rendition.name', actual.name, expected.name));
  }
  if (actual.isDefault !== expected.isDefault) {
    return t.fail(buildMessage('Rendition.isDefault', actual.isDefault, expected.isDefault));
  }
  if (actual.autoselect !== expected.autoselect) {
    return t.fail(buildMessage('Rendition.autoselect', actual.autoselect, expected.autoselect));
  }
  if (actual.forced !== expected.forced) {
    return t.fail(buildMessage('Rendition.forced', actual.forced, expected.forced));
  }
  if (actual.instreamId !== expected.instreamId) {
    return t.fail(buildMessage('Rendition.instreamId', actual.instreamId, expected.instreamId));
  }
  if (actual.characteristics !== expected.characteristics) {
    return t.fail(buildMessage('Rendition.characteristics', actual.characteristics, expected.characteristics));
  }
  if (actual.channels !== expected.channels) {
    return t.fail(buildMessage('Rendition.channels', actual.channels, expected.channels));
  }
}

function deepEqualMap(t, actual, expected) {
  if (!expected) {
    return;
  }
  if (expected.uri) {
    if (!actual.uri || actual.uri.href !== expected.uri.href) {
      return t.fail(buildMessage('MediaInitializationSection.uri', actual.uri, expected.uri));
    }
  }
  if (expected.byterange) {
    if (!actual.byterange || actual.byterange.length !== expected.byterange.length || actual.byterange.offset !== expected.byterange.offset) {
      return t.fail(buildMessage('MediaInitializationSection.byterange', actual.byterange, expected.byterange));
    }
  }
}

function deepEqualDateRange(t, actual, expected) {
  if (!expected) {
    return;
  }
  if (actual.id !== expected.id) {
    return t.fail(buildMessage('DateRange.id', actual.id, expected.id));
  }
  if (actual.classId !== expected.classId) {
    return t.fail(buildMessage('DateRange.classId', actual.classId, expected.classId));
  }
  if (expected.start) {
    if (!actual.start || actual.start.getTime() !== expected.start.getTime()) {
      return t.fail(buildMessage('DateRange.start', actual.start, expected.start));
    }
  }
  if (expected.end) {
    if (!actual.end || actual.end.getTime() !== expected.end.getTime()) {
      return t.fail(buildMessage('DateRange.end', actual.end, expected.end));
    }
  }
  if (actual.duration !== expected.duration) {
    return t.fail(buildMessage('DateRange.duration', actual.duration, expected.duration));
  }
  if (actual.plannedDuration !== expected.plannedDuration) {
    return t.fail(buildMessage('DateRange.plannedDuration', actual.plannedDuration, expected.plannedDuration));
  }
  if (actual.endOnNext !== expected.endOnNext) {
    return t.fail(buildMessage('DateRange.endOnNext', actual.endOnNext, expected.endOnNext));
  }
}
