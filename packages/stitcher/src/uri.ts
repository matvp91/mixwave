import { env } from "./env.js";
import { join } from "path";

const uuidRegex = /^[a-z,0-9,-]{36,36}$/;

export type Format = {
  base: string;
  file: string;
  url: string;
};

/**
 * @example From https://test-streams.mux.dev/path/master.m3u8
 *          to https://test-streams.mux.dev/path (base) and master.m3u8 (file)
 * @param uri
 * @returns
 */
export function formatUri(uri: string): Format {
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    const file = uri.split("/").pop();
    if (!file) {
      throw new Error("Got http(s) uri but no file.");
    }
    return {
      base: uri.substring(0, uri.lastIndexOf("/")),
      file,
      url: uri,
    };
  }

  if (uuidRegex.test(uri)) {
    // We prefer using the mix protocol for asset identification but we allow
    // just uuid's too and assume it's a valid assetId.
    uri = `mix://${uri}`;
  }

  if (uri.startsWith("mix://")) {
    const assetId = uri.substring("mix://".length);
    return {
      base: `${env.PUBLIC_S3_ENDPOINT}/package/${assetId}/hls`,
      file: "master.m3u8",
      url: `${env.PUBLIC_S3_ENDPOINT}/package/${assetId}/hls/master.m3u8`,
    };
  }

  throw new Error(`Invalid uri for base: ${uri}`);
}

export async function isUrlAvailable(url: string) {
  const response = await fetch(url, {
    method: "HEAD",
  });
  return response.ok;
}

export function withPath(base: string, ...paths: string[]) {
  const url = new URL(base);
  return `${url.protocol}//${url.host}${join(url.pathname, ...paths)}`;
}
