import { env } from "./env.js";

export async function isAssetAvailable(assetId: string) {
  const response = await fetch(
    `${env.S3_PUBLIC_URL}/package/${assetId}/hls/master.m3u8`,
    {
      method: "HEAD",
    },
  );
  return response.ok;
}
