import { parseMasterPlaylist, parseMediaPlaylist } from "./parser/index.js";
import { assert } from "./assert.js";
import { getMasterUrl, joinPath, getDir } from "./url.js";
import { LRUCache } from "lru-cache";
import type { Segment, MasterPlaylist } from "./parser/index.js";

export type MediaType = "video" | "audio" | "text";

const playlistTextCache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});

export class Presentation {
  private url_: string;

  constructor(uri: string) {
    this.url_ = getMasterUrl(uri);
  }

  get url() {
    return this.url_;
  }

  async getMaster() {
    const text = await fetchPlaylistText(this.url_);
    return parseMasterPlaylist(text);
  }

  private async getMedia_(path: string) {
    const url = joinPath(getDir(this.url_), path);
    const text = await fetchPlaylistText(url);

    const media = parseMediaPlaylist(text);

    this.makeSegmentsAbsolute_(media.segments, path);

    return media;
  }

  private makeSegmentsAbsolute_(segments: Segment[], path: string) {
    const url = joinPath(getDir(this.url_), path);
    const dir = getDir(url);

    segments.forEach((segment) => {
      if (segment.map?.uri === "init.mp4") {
        segment.map.uri = joinPath(dir, segment.map.uri);
      }
      segment.uri = joinPath(dir, segment.uri);
    });
  }

  private getMediaType_(
    path: string,
    master: MasterPlaylist,
  ): MediaType | null {
    for (const variant of master.variants) {
      if (variant.uri === path) {
        return "video";
      }

      for (const audio of variant.audio) {
        if (audio.uri === path) {
          return "audio";
        }
      }

      for (const subtitles of variant.subtitles) {
        if (subtitles.uri === path) {
          return "text";
        }
      }
    }

    return null;
  }

  async getMedia(path: string) {
    const master = await this.getMaster();
    const media = await this.getMedia_(path);

    const mediaType = this.getMediaType_(path, master);
    assert(mediaType, `A mediaType for "${path}" could not be found.`);

    return {
      mediaType,
      media,
    };
  }

  async getDuration() {
    const master = await this.getMaster();
    const media = await this.getMedia_(master.variants[0].uri);

    return media.segments.reduce((acc, segment) => {
      acc += segment.duration;
      return acc;
    }, 0);
  }
}

async function fetchPlaylistText(url: string) {
  let result = playlistTextCache.get(url);
  if (!result) {
    const response = await fetch(url);
    result = await response.text();

    playlistTextCache.set(url, result);
  }
  return result;
}
