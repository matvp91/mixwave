import { formatUri, withPath } from "../uri.js";
import { DateTime } from "luxon";
import { parseMasterPlaylist } from "../parser/index.js";
import type { MasterPlaylist } from "../parser/index.js";

export type ChannelBlock = {
  start: DateTime;
  end: DateTime;
  master: MasterPlaylist;
  uri: string;
};

export async function getChannelBlock(
  start: string,
  end: string,
  uri: string,
): Promise<ChannelBlock> {
  const format = formatUri(uri);
  const url = withPath(format.base, format.file);
  const master = await getMasterPlaylist(url);

  return {
    start: DateTime.fromISO(start),
    end: DateTime.fromISO(end),
    master,
    uri,
  };
}

const cache = new Map<string, Promise<string>>();

async function getMasterPlaylist(url: string) {
  let promise = cache.get(url);

  if (!promise) {
    const response = await fetch(url);
    promise = response.text();

    cache.set(url, promise);
  }

  const text = await promise;

  return parseMasterPlaylist(text);
}
