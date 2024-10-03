import { assert } from "../assert.js";
import { lexicalParse } from "./lexical-parse.js";
import { pushRendition } from "./utils.js";
import type {
  MediaPlaylist,
  MasterPlaylist,
  PlaylistType,
  MediaInitializationSection,
  Segment,
  Variant,
  Rendition,
} from "./types.js";
import type { Tag, StreamInf, Media } from "./lexical-parse.js";
import type { DateTime } from "luxon";

function formatMediaPlaylist(tags: Tag[]): MediaPlaylist {
  let targetDuration: number | undefined;
  let endlist = false;
  let playlistType: PlaylistType | undefined;
  let independentSegments = false;
  let mediaSequenceBase: number | undefined;
  let discontinuitySequenceBase: number | undefined;

  let map: MediaInitializationSection | undefined;

  tags.forEach(([name, value]) => {
    if (name === "EXT-X-TARGETDURATION") {
      targetDuration = value;
    }
    if (name === "EXT-X-ENDLIST") {
      endlist = true;
    }
    if (name === "EXT-X-PLAYLIST-TYPE") {
      playlistType = value;
    }
    if (name === "EXT-X-MAP") {
      map = {
        uri: value.uri,
      };
    }
    if (name === "EXT-X-INDEPENDENT-SEGMENTS") {
      independentSegments = true;
    }
    if (name === "EXT-X-MEDIA-SEQUENCE") {
      mediaSequenceBase = value;
    }
    if (name === "EXT-X-DISCONTINUITY-SEQUENCE") {
      discontinuitySequenceBase = value;
    }
  });

  const segments = tags.reduce<Segment[]>((acc, [name, value], index) => {
    if (name !== "EXTINF") {
      return acc;
    }

    let segmentStart = index;
    let segmentEnd = index + 1;
    for (let i = index; i > 0; i--) {
      if (tags[i][0] === "LITERAL") {
        segmentStart = i + 1;
        break;
      }
    }

    const segmentTags = tags.slice(segmentStart, segmentEnd);
    const uri = nextLiteral(tags, index);

    const segment = parseSegment(segmentTags, uri, map);

    acc.push(segment);

    return acc;
  }, []);

  assert(targetDuration);

  return {
    isMasterPlaylist: false,
    targetDuration,
    endlist,
    playlistType,
    segments,
    independentSegments,
    mediaSequenceBase,
    discontinuitySequenceBase,
    // TODO: We're not going to parse dateRanges for now, we're only going to
    // allow to set them manually, such as interstitials.
    dateRanges: [],
  };
}

function parseSegment(
  tags: Tag[],
  uri: string,
  map?: MediaInitializationSection,
): Segment {
  let duration: number | undefined;
  let discontinuity: boolean | undefined;
  let programDateTime: DateTime | undefined;

  tags.forEach(([name, value]) => {
    if (name === "EXTINF") {
      duration = value.duration;
    }
    if (name === "EXT-X-DISCONTINUITY") {
      discontinuity = true;
    }
    if (name === "EXT-X-PROGRAM-DATE-TIME") {
      programDateTime = value;
    }
  });

  assert(duration, "parseSegment: duration not found");

  return {
    uri,
    duration,
    discontinuity,
    map,
    programDateTime,
  };
}

function addRendition(variant: Variant, media: Media) {
  const rendition: Rendition = {
    type: media.type,
    groupId: media.groupId,
    name: media.name,
    uri: media.uri,
  };

  if (media.type === "AUDIO") {
    pushRendition("audio", variant, rendition);
  }

  if (media.type === "SUBTITLES") {
    pushRendition("subtitles", variant, rendition);
  }
}

function parseVariant(tags: Tag[], streamInf: StreamInf, uri: string) {
  const variant: Variant = {
    uri,
    bandwidth: streamInf.bandwidth,
    resolution: streamInf.resolution,
    audio: [],
    subtitles: [],
  };

  for (const [name, value] of tags) {
    if (name === "EXT-X-MEDIA") {
      if (
        streamInf.audio === value.groupId ||
        streamInf.subtitles === value.groupId
      ) {
        addRendition(variant, value);
      }
    }
  }

  return variant;
}

function formatMasterPlaylist(tags: Tag[]): MasterPlaylist {
  const variants: Variant[] = [];
  let independentSegments = false;

  tags.forEach(([name, value], index) => {
    if (name === "EXT-X-STREAM-INF") {
      const uri = nextLiteral(tags, index);
      const variant = parseVariant(tags, value, uri);
      variants.push(variant);
    }
    if (name === "EXT-X-INDEPENDENT-SEGMENTS") {
      independentSegments = true;
    }
  });

  return {
    isMasterPlaylist: true,
    independentSegments,
    variants,
  };
}

function nextLiteral(tags: Tag[], index: number) {
  if (!tags[index + 1]) {
    throw new Error("Expecting next tag to be found");
  }
  const [name, value] = tags[index + 1];
  if (name !== "LITERAL") {
    throw new Error("Expecting next tag to be a literal");
  }
  return value;
}

export function parseMasterPlaylist(text: string) {
  const tags = lexicalParse(text);
  return formatMasterPlaylist(tags);
}

export function parseMediaPlaylist(text: string) {
  const tags = lexicalParse(text);
  return formatMediaPlaylist(tags);
}
