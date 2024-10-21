import * as path from "path";
import { env } from "./env";

const uuidRegex = /^[a-z,0-9,-]{36,36}$/;

const ASSET_PROTOCOL = "asset:";

export function getMasterUrl(uri: string) {
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  const potentialUuid = uri.split("@", 2)[0];
  if (uuidRegex.test(potentialUuid)) {
    uri = `${ASSET_PROTOCOL}//${uri}`;
  }

  if (uuidRegex.test(uri)) {
    // We prefer using the asset protocol for asset identification but we allow
    // just uuid's too and assume it's a valid assetId.
    uri = `${ASSET_PROTOCOL}//${uri}`;
  }

  if (uri.startsWith(`${ASSET_PROTOCOL}//`)) {
    const [assetId, prefix = "hls"] = uri
      .substring(`${ASSET_PROTOCOL}//`.length)
      .split("@");
    return `${env.PUBLIC_S3_ENDPOINT}/package/${assetId}/${prefix}/master.m3u8`;
  }

  throw new Error(`Invalid uri: "${uri}"`);
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
