import { env } from "./env.js";
import type * as hlsParser from "../extern/hls-parser/index.js";

export async function isAssetAvailable(assetId: string) {
  const response = await fetch(
    `${env.PUBLIC_S3_ENDPOINT}/package/${assetId}/hls/master.m3u8`,
    {
      method: "HEAD",
    },
  );
  return response.ok;
}

export function filterByString(items: hlsParser.types.Variant[], str: string) {
  const [operator, value] = str.split(" ");

  if (operator === "<") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height < parseInt(value, 10),
    );
  }

  if (operator === "<=") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height <= parseInt(value, 10),
    );
  }

  if (operator === ">") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height > parseInt(value, 10),
    );
  }

  if (operator === ">=") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height >= parseInt(value, 10),
    );
  }

  throw new Error("Invalid filter");
}

export function resolveUri(uri: string) {
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  if (uri.startsWith("mix://")) {
    const assetId = uri.substring("mix://".length);
    return `${env.PUBLIC_S3_ENDPOINT}/package/${assetId}/hls/master.m3u8`;
  }

  throw new Error("Failed to resolve uri");
}

export async function isUrlAvailable(url: string) {
  const response = await fetch(url, {
    method: "HEAD",
  });
  return response.ok;
}
