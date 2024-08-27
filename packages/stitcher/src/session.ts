import { client } from "./redis.js";
import { randomUUID } from "crypto";
import { getInterstitialsFromVmap } from "./vmap.js";
import type { Session, Interstitial } from "./types.js";

const REDIS_PREFIX = `stitcher:session`;

const key = (sessionId: string) => `${REDIS_PREFIX}:${sessionId}`;

export async function createSession(data: {
  assetId: string;
  vmapUrl?: string;
  interstitials?: Interstitial[];
  bumperAssetId?: string;
}) {
  const sessionId = randomUUID();

  const interstitials: Interstitial[] = [];

  if (data.vmapUrl) {
    interstitials.push(...(await getInterstitialsFromVmap(data.vmapUrl)));
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

  await client.json.set(key(sessionId), `$`, session);

  await client.expire(key(sessionId), 60 * 60 * 6);

  return session;
}

export async function getSession(sessionId: string) {
  const data = await client.json.get(key(sessionId));
  if (!data) {
    throw new Error("No session found for id");
  }
  return data as Session;
}
