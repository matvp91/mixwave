import * as path from "path";
import { env } from "./env.js";

const uuidRegex = /^[a-z,0-9,-]{36,36}$/;

export function getMasterUrl(uri: string) {
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  if (uuidRegex.test(uri)) {
    // We prefer using the mix protocol for asset identification but we allow
    // just uuid's too and assume it's a valid assetId.
    uri = `mix://${uri}`;
  }

  if (uri.startsWith("mix://")) {
    const assetId = uri.substring("mix://".length);
    return `${env.PUBLIC_S3_ENDPOINT}/package/${assetId}/hls/master.m3u8`;
  }

  throw new Error(`Invalid uri: ${uri}`);
}

export function joinPath(base: string, ...paths: string[]) {
  const url = new URL(base);
  return `${url.protocol}//${url.host}${path.join(url.pathname, ...paths)}`;
}

export function getDir(url: string) {
  return url.substring(0, url.lastIndexOf("/"));
}

export async function isUrlAvailable(url: string) {
  const response = await fetch(url, {
    method: "HEAD",
  });
  return response.ok;
}
