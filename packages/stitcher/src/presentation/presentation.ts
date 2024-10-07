import {
  MediaPlaylist,
  parseMasterPlaylist,
  parseMediaPlaylist,
} from "../parser/index.js";
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
    const master = parseMasterPlaylist(text);
    return master;
  }

  async getMedia(path: string): Promise<{
    type: MediaType;
    playlist: MediaPlaylist;
  }> {
    const dir = getDir(this.url_);
    const url = joinPath(dir, path);

    const master = await this.getMaster();

    const text = await fetchText(url);
    const media = parseMediaPlaylist(text);

    rewriteSegmentToAbsolute(media, getDir(url));

    for (const variant of master.variants) {
      if (variant.uri === path) {
        return {
          type: "video",
          playlist: media,
        };
      }

      for (const audio of variant.audio) {
        if (audio.uri === path) {
          return {
            type: "audio",
            playlist: media,
          };
        }
      }

      for (const subtitles of variant.subtitles) {
        if (subtitles.uri === path) {
          return {
            type: "text",
            playlist: media,
          };
        }
      }
    }

    throw new Error(`Cannot find playlist for path "${path}"`);
  }
}
