import { env } from "./env.js";
import type * as hlsParser from "../extern/hls-parser/index.js";

export async function isAssetAvailable(assetId: string) {
  const response = await fetch(
    `${env.S3_PUBLIC_URL}/package/${assetId}/hls/master.m3u8`,
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
