import { client } from "./redis.js";
import { randomUUID } from "crypto";
import { extractInterstitialFromVmapAdbreak } from "./vast.js";
import { getVmap } from "./vmap.js";
import type { Session, Interstitial } from "./types.js";

const REDIS_PREFIX = `stitcher:session`;

function getRedisKey(sessionId: string) {
  return `${REDIS_PREFIX}:${sessionId}`;
}

export async function createSession(data: {
  assetId: string;
  vmapUrl?: string;
  interstitials?: Interstitial[];
  bumperAssetId?: string;
}) {
  const sessionId = randomUUID();

  const interstitials: Interstitial[] = [];

  if (data.vmapUrl) {
    const vmap = await getVmap(data.vmapUrl);

    for (const adBreak of vmap.adBreaks) {
      interstitials.push(
        ...(await extractInterstitialFromVmapAdbreak(adBreak)),
      );
    }
  }

  if (data.interstitials) {
    interstitials.push(...data.interstitials);
  }

  // When we have a bumper, we'll push it at the end of the interstitials list.
  if (data.bumperAssetId) {
    interstitials.push({
      timeOffset: 0,
      assetId: data.bumperAssetId,
    });
  }

  const session = {
    id: sessionId,
    assetId: data.assetId,
    interstitials,
  } satisfies Session;

  const redisKey = getRedisKey(sessionId);

  await client.json.set(redisKey, `$`, session);
  await client.expire(redisKey, 60 * 60 * 6);

  return session;
}

export async function getSession(sessionId: string) {
  const redisKey = getRedisKey(sessionId);

  const data = await client.json.get(redisKey);
  if (!data) {
    throw new Error("No session found for id");
  }

  return data as Session;
}
