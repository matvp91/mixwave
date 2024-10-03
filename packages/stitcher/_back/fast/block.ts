import { formatUri, withPath } from "../uri.js";
import { parseMasterPlaylist, parseMediaPlaylist } from "../parser/index.js";
import type {
  MediaPlaylist,
  MasterPlaylist,
  Variant,
} from "../parser/index.js";

export class Block {
  static async create(uri: string) {
    const format = formatUri(uri);
    const url = withPath(format.base, format.file);

    const master = await fetchMasterPlaylist(url);

    const pairs = await Promise.all(
      master.variants.map(async (variant) => {
        const url = withPath(format.base, variant.uri);
        return {
          variant,
          media: await fetchMediaPlaylist(url),
        };
      }),
    );

    return new Block(master, pairs);
  }

  constructor(
    public master: MasterPlaylist,
    private pairs_: { variant: Variant; media: MediaPlaylist }[],
  ) {}

  get duration() {
    const { segments } = this.pairs_[0].media;
    return segments.reduce<number>((acc, segment) => {
      return acc + segment.duration;
    }, 0);
  }
}

async function fetchMasterPlaylist(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parseMasterPlaylist(text);
}

async function fetchMediaPlaylist(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parseMediaPlaylist(text);
}
