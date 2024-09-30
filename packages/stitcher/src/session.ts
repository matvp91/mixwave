import { client } from "./redis.js";
import { randomUUID } from "crypto";
import { extractInterstitialFromVmapAdbreak } from "./vast.js";
import { getVmap } from "./vmap.js";
import createError from "@fastify/error";
import type { Session, Interstitial } from "./types.js";

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
  uri: string;
  vmap?: {
    url: string;
  };
  interstitials?: Interstitial[];
  resolution?: string;
}) {
  const sessionId = randomUUID();

  let interstitials: Interstitial[] | undefined;

  if (data.vmap) {
    const vmap = await getVmap(data.vmap.url);

    for (const adBreak of vmap.adBreaks) {
      if (!interstitials) {
        interstitials = [];
      }

      interstitials.push(
        ...(await extractInterstitialFromVmapAdbreak(adBreak)),
      );
    }
  }

  if (data.interstitials?.length) {
    if (!interstitials) {
      interstitials = [];
    }

    interstitials.push(...data.interstitials);
  }

  const session = {
    id: sessionId,
    uri: data.uri,
    interstitials,
    resolution: data.resolution,
  } satisfies Session;

  const redisKey = getRedisKey(sessionId);

  const rawSession = JSON.parse(JSON.stringify(session));

  await client.json.set(redisKey, `$`, rawSession);
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
