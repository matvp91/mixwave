import {
  MasterPlaylist,
  MediaPlaylist,
  parseMasterPlaylist,
  parseMediaPlaylist,
} from "../parser/index.js";
import { assert } from "../assert.js";
import { rewriteSegmentToAbsolute, fetchText } from "./utils.js";
import { getMasterUrl, joinPath, getDir } from "../url.js";

export type MediaType = "video" | "audio" | "text";

export class Presentation {
  private url_: string;

  constructor(uri: string) {
    this.url_ = getMasterUrl(uri);
  }

  async getMaster() {
    const text = await fetchText(this.url_);
    return parseMasterPlaylist(text);
  }

  private async getMedia_(path: string) {
    const url = joinPath(getDir(this.url_), path);
    const text = await fetchText(url);

    const media = parseMediaPlaylist(text);

    rewriteSegmentToAbsolute(media, getDir(url));

    return media;
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
}
