import { formatUri, withPath } from "../uri.js";
import { parseMasterPlaylist, parseMediaPlaylist } from "../parser/index.js";
import { rewriteSegmentToAbsolute } from "./utils.js";
import { filterVariants } from "./filters.js";
import type { Format } from "../uri.js";
import type { Filter } from "../types.js";
import type { Stream } from "./types.js";

export type PresentationOptions = {
  filter?: Filter;
};

export class Presentation {
  private format_: Format;

  constructor(
    uri: string,
    private options_: PresentationOptions = {},
  ) {
    this.format_ = formatUri(uri);
  }

  async getMaster() {
    const text = await fetchText(this.format_.url);
    const master = parseMasterPlaylist(text);

    if (this.options_.filter?.resolution) {
      master.variants = filterVariants(
        master.variants,
        this.options_.filter.resolution,
      );
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
    const url = withPath(this.format_.base, path);
    const format = formatUri(url);

    const text = await fetchText(url);
    const media = parseMediaPlaylist(text);

    rewriteSegmentToAbsolute(media, format);

    return media;
  }
}

async function fetchText(url: string) {
  const response = await fetch(url);
  return await response.text();
}
