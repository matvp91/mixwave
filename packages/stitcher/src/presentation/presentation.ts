import { parseMasterPlaylist, parseMediaPlaylist } from "../parser/index.js";
import { rewriteSegmentToAbsolute } from "./utils.js";
import { getMasterUrl, joinPath, getDir } from "../url.js";
import type { Stream } from "./types.js";

export class Presentation {
  private url_: string;

  constructor(uri: string) {
    this.url_ = getMasterUrl(uri);
  }

  async getMaster() {
    const text = await fetchText(this.url_);
    const master = parseMasterPlaylist(text);
    const dir = getDir(this.url_);

    // Direct audio and subtitle uris to their original base, they do not
    // need to be rewritten by the media playlist proxy.
    // TODO: We probably want each playlist to go through this.
    for (const v of master.variants) {
      for (const audioRendition of v.audio) {
        if (audioRendition.uri) {
          audioRendition.uri = joinPath(dir, audioRendition.uri);
        }
      }
      for (const subtitleRendition of v.subtitles) {
        if (subtitleRendition.uri) {
          subtitleRendition.uri = joinPath(dir, subtitleRendition.uri);
        }
      }
    }

    return master;
  }

  async getStreams(): Promise<Stream[]> {
    const master = await this.getMaster();
    return await Promise.all(
      master.variants.map(async (variant) => ({
        variant,
        media: await this.getMedia(variant.uri),
      })),
    );
  }

  async getMedia(path: string) {
    const dir = getDir(this.url_);
    const url = joinPath(dir, path);

    const text = await fetchText(url);
    const media = parseMediaPlaylist(text);

    rewriteSegmentToAbsolute(media, getDir(url));

    return media;
  }
}

async function fetchText(url: string) {
  const response = await fetch(url);
  return await response.text();
}
