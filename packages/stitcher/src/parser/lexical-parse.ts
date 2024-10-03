import { assert } from "../assert.js";
import { mapAttributes, partOf } from "./helpers.js";
import { DateTime } from "luxon";
import type {
  Resolution,
  MediaInitializationSection,
  PlaylistType,
} from "./types.js";

// Based on the latest spec:
// https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis

const EMPTY_TAGS = [
  "EXTM3U",
  "EXT-X-DISCONTINUITY",
  "EXT-X-ENDLIST",
  "EXT-X-I-FRAMES-ONLY",
  "EXT-X-INDEPENDENT-SEGMENTS",
] as const;

const NUMBER_TAGS = [
  "EXT-X-VERSION",
  "EXT-X-TARGETDURATION",
  "EXT-X-MEDIA-SEQUENCE",
  "EXT-X-DISCONTINUITY-SEQUENCE",
] as const;

const DATE_TAGS = ["EXT-X-PROGRAM-DATE-TIME"] as const;

type OneOf<T extends readonly string[]> = T[number];

export type Tag =
  | ["LITERAL", string]
  | [OneOf<typeof EMPTY_TAGS>, null]
  | [OneOf<typeof NUMBER_TAGS>, number]
  | [OneOf<typeof DATE_TAGS>, DateTime]
  | ["EXTINF", ExtInf]
  | ["EXT-X-PLAYLIST-TYPE", PlaylistType]
  | ["EXT-X-STREAM-INF", StreamInf]
  | ["EXT-X-MEDIA", Media]
  | ["EXT-X-MAP", MediaInitializationSection];

export type ExtInf = {
  duration: number;
};

export type StreamInf = {
  bandwidth: number;
  resolution?: Resolution;
  audio?: string;
  subtitles?: string;
};

export type MediaType = "AUDIO" | "SUBTITLES";

export type Media = {
  type: MediaType;
  groupId: string;
  name: string;
  uri?: string;
};

function parseLine(line: string): Tag | null {
  const [name, param] = splitLine(line);

  if (partOf(EMPTY_TAGS, name)) {
    return [name, null];
  }

  if (partOf(NUMBER_TAGS, name)) {
    assert(param, "NUMBER_TAGS: no param");
    return [name, Number.parseFloat(param)];
  }

  if (partOf(DATE_TAGS, name)) {
    assert(param, "DATE_TAGS: no param");
    return [name, DateTime.fromISO(param)];
  }

  switch (name) {
    case "EXT-X-PLAYLIST-TYPE":
      assert(param, "EXT-X-PLAYLIST-TYPE: no param");
      if (param === "EVENT" || param === "VOD") {
        return [name, param];
      }
      throw new Error("EXT-X-PLAYLIST-TYPE: param must be EVENT or VOD");

    case "EXTINF":
      assert(param, "EXTINF: no param");
      const chunks = param.split(",");
      return [
        name,
        {
          duration: parseFloat(chunks[0]),
        },
      ];

    case "EXT-X-STREAM-INF": {
      assert(param, "EXT-X-STREAM-INF: no param");

      const attrs: Partial<StreamInf> = {};

      mapAttributes(param, (key, value) => {
        switch (key) {
          case "BANDWIDTH":
            attrs.bandwidth = Number.parseFloat(value);
            break;

          case "RESOLUTION":
            const chunks = value.split("x");
            attrs.resolution = {
              width: parseFloat(chunks[0]),
              height: parseFloat(chunks[1]),
            };
            break;

          case "AUDIO":
            attrs.audio = value;
            break;

          case "SUBTITLES":
            attrs.subtitles = value;
            break;
        }
      });

      assert(attrs.bandwidth, "EXT-X-STREAM-INF: no bandwidth");

      return [
        name,
        {
          bandwidth: attrs.bandwidth,
          resolution: attrs.resolution,
          audio: attrs.audio,
          subtitles: attrs.subtitles,
        },
      ];
    }

    case "EXT-X-MEDIA": {
      assert(param, "EXT-X-MEDIA: no param");

      const attrs: Partial<Media> = {};

      mapAttributes(param, (key, value) => {
        switch (key) {
          case "TYPE":
            if (value === "AUDIO" || value === "SUBTITLES") {
              attrs.type = value;
            } else {
              throw new Error("EXT-X-MEDIA: invalid type param");
            }
          case "GROUP-ID":
            attrs.groupId = value;
            break;
          case "NAME":
            attrs.name = value;
            break;
          case "URI":
            attrs.uri = value;
            break;
        }
      });

      assert(attrs.type, "EXT-X-MEDIA: no type");
      assert(attrs.groupId, "EXT-X-MEDIA: no groupId");
      assert(attrs.name, "EXT-X-MEDIA: no name");

      return [
        name,
        {
          type: attrs.type,
          groupId: attrs.groupId,
          name: attrs.name,
          uri: attrs.uri,
        },
      ];
    }

    case "EXT-X-MAP": {
      assert(param, "EXT-X-MAP: no param");

      const attrs: Partial<MediaInitializationSection> = {};

      mapAttributes(param, (key, value) => {
        switch (key) {
          case "URI":
            attrs.uri = value;
            break;
        }
      });

      assert(attrs.uri, "EXT-X-MAP: no uri");

      return [
        name,
        {
          uri: attrs.uri,
        },
      ];
    }

    default:
      return null;
  }
}

function splitLine(line: string): [string, string | null] {
  const index = line.indexOf(":");
  if (index === -1) {
    return [line.slice(1).trim(), null];
  }
  return [line.slice(1, index).trim(), line.slice(index + 1).trim()];
}

export function lexicalParse(text: string) {
  const tags: Tag[] = [];

  for (const l of text.split("\n")) {
    const line = l.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith("#")) {
      if (line.startsWith("#EXT")) {
        const tag = parseLine(line);
        if (tag) {
          tags.push(tag);
        }
      }
      continue;
    }

    tags.push(["LITERAL", line]);
  }

  if (!tags.length) {
    throw new Error("lexicalParse: no tags");
  }

  return tags;
}
