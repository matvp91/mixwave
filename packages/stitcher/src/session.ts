import { client } from "./redis.js";
import { randomUUID } from "crypto";
import type { Session, Interstitial, Filter, Vmap } from "./types.js";

const REDIS_PREFIX = `stitcher:session`;

function getRedisKey(sessionId: string) {
  return `${REDIS_PREFIX}:${sessionId}`;
}

export async function createSession(data: {
  uri: string;
  interstitials?: Interstitial[];
  filter?: Filter;
  vmap?: Vmap;
}) {
  const sessionId = randomUUID();

  const session: Session = {
    id: sessionId,
    uri: data.uri,
    filter: data.filter,
    interstitials: data.interstitials,
    vmap: data.vmap,
  };

  const redisKey = getRedisKey(sessionId);

  await client.json.set(redisKey, `$`, session);
  await client.expire(redisKey, 60 * 60 * 6);

  return session;
}

export async function getSession(sessionId: string) {
  const redisKey = getRedisKey(sessionId);

  const data = await client.json.get(redisKey);
  if (!data) {
    throw new Error(`No session for id "${sessionId}"`);
  }

  return data as Session;
}
