import { Lines } from "./lines.js";
import type {
  Rendition,
  Variant,
  MasterPlaylist,
  Segment,
  MediaPlaylist,
  MediaInitializationSection,
  DateRange,
} from "./types.js";

function buildRendition(lines: Lines, rendition: Rendition) {
  const attrs = [
    `TYPE=${rendition.type}`,
    `GROUP-ID="${rendition.groupId}"`,
    `NAME="${rendition.name}"`,
  ];
  if (rendition.uri) {
    attrs.push(`URI="${rendition.uri}"`);
  }
  lines.push(`#EXT-X-MEDIA:${attrs.join(",")}`);
}

function buildVariant(lines: Lines, variant: Variant) {
  const attrs = [`BANDWIDTH=${variant.bandwidth}`];

  if (variant.resolution) {
    attrs.push(
      `RESOLUTION=${variant.resolution.width}x${variant.resolution.height}`,
    );
  }
  if (variant.audio?.length) {
    attrs.push(`AUDIO="${variant.audio[0].groupId}"`);
    for (const rendition of variant.audio) {
      buildRendition(lines, rendition);
    }
  }

  if (variant.subtitles?.length) {
    attrs.push(`SUBTITLES="${variant.subtitles[0].groupId}"`);
    for (const rendition of variant.subtitles) {
      buildRendition(lines, rendition);
    }
  }

  lines.push(`#EXT-X-STREAM-INF:${attrs.join(",")}`);
  lines.push(variant.uri);
}

function stringifyMasterPlaylist(playlist: MasterPlaylist) {
  const lines = new Lines();

  lines.push("#EXTM3U", "#EXT-X-VERSION:8");

  if (playlist.independentSegments) {
    lines.push("#EXT-X-INDEPENDENT-SEGMENTS");
  }

  playlist.variants.forEach((variant) => {
    buildVariant(lines, variant);
  });

  return lines.join("\n");
}

function buildSegment(lines: Lines, segment: Segment) {
  if (segment.discontinuity) {
    lines.push(`#EXT-X-DISCONTINUITY`);
  }

  if (segment.map) {
    buildMap(lines, segment.map);
  }

  if (segment.programDateTime) {
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${segment.programDateTime.toISO()}`);
  }

  let duration = segment.duration.toFixed(3);
  if (duration.match(/\./)) {
    duration = duration.replace(/\.?0+$/, "");
  }

  lines.push(`#EXTINF:${duration}`);

  lines.push(segment.uri);
}

function buildMap(lines: Lines, map: MediaInitializationSection) {
  const attrs = [`URI="${map.uri}"`];
  lines.push(`#EXT-X-MAP:${attrs.join(",")}`);
}

function buildDateRange(lines: Lines, dateRange: DateRange) {
  const attrs = [
    `ID="${dateRange.id}"`,
    `CLASS="${dateRange.classId}"`,
    `START-DATE="${dateRange.startDate.toISO()}"`,
  ];

  if (dateRange.clientAttributes) {
    const entries = Object.entries(dateRange.clientAttributes);
    for (const [key, value] of entries) {
      if (typeof value === "string") {
        attrs.push(`X-${key}="${value}"`);
      }
      if (typeof value === "number") {
        attrs.push(`X-${key}=${value}`);
      }
    }
  }

  lines.push(`#EXT-X-DATERANGE:${attrs.join(",")}`);
}

function stringifyMediaPlaylist(playlist: MediaPlaylist) {
  const lines = new Lines();

  lines.push(
    "#EXTM3U",
    "#EXT-X-VERSION:8",
    `#EXT-X-TARGETDURATION:${playlist.targetDuration}`,
  );

  if (playlist.independentSegments) {
    lines.push("#EXT-X-INDEPENDENT-SEGMENTS");
  }

  if (playlist.mediaSequenceBase) {
    lines.push(`#EXT-X-MEDIA-SEQUENCE:${playlist.mediaSequenceBase}`);
  }

  if (playlist.discontinuitySequenceBase) {
    lines.push(
      `#EXT-X-DISCONTINUITY-SEQUENCE:${playlist.discontinuitySequenceBase}`,
    );
  }

  if (playlist.playlistType) {
    lines.push(`#EXT-X-PLAYLIST-TYPE:${playlist.playlistType}`);
  }

  playlist.segments.forEach((segment) => {
    buildSegment(lines, segment);
  });

  if (playlist.endlist) {
    lines.push(`#EXT-X-ENDLIST`);
  }

  playlist.dateRanges?.forEach((dateRange) => {
    buildDateRange(lines, dateRange);
  });

  return lines.join("\n");
}

export function stringify(playlist: MasterPlaylist | MediaPlaylist) {
  if (playlist.isMasterPlaylist) {
    return stringifyMasterPlaylist(playlist);
  } else {
    return stringifyMediaPlaylist(playlist);
  }
}
