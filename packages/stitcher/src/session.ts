import { client } from "./redis.js";
import { randomUUID } from "crypto";
import { extractInterstitialFromVmapAdbreak } from "./vast.js";
import { getVmap } from "./vmap.js";
import createError from "@fastify/error";
import type { Session, Interstitial } from "./types.js";
import { isAssetAvailable } from "./helpers.js";

const NoSessionError = createError<[string]>(
  "NO_SESSION",
  "A session with id %s is not found.",
  404,
);

const REDIS_PREFIX = `stitcher:session`;

function getRedisKey(sessionId: string) {
  return `${REDIS_PREFIX}:${sessionId}`;
}

const PlaylistUnavailableError = createError<[string]>(
  "PLAYLIST_UNAVAILABLE",
  "%s is unavailable.",
  404,
);

export async function createSession(data: {
  assetId: string;
  vmapUrl?: string;
  interstitials?: Interstitial[];
  bumperAssetId?: string;
  maxResolution?: number;
}) {
  if (!(await isAssetAvailable(data.assetId))) {
    throw new PlaylistUnavailableError(data.assetId);
  }

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
      type: "bumper",
    });
  }

  let maxResolution = data.maxResolution;
  if (!maxResolution) {
    const MAX_RESOLUTION_8K = 4320;
    maxResolution = MAX_RESOLUTION_8K;
  }

  const session = {
    id: sessionId,
    assetId: data.assetId,
    interstitials,
    maxResolution,
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
    throw new NoSessionError(sessionId);
  }

  return data as Session;
}
