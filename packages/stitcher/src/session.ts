import { client } from "./redis.js";
import { randomUUID } from "crypto";
import { resolveVmap } from "./vmap.js";
import type { Session, Ad } from "./types.js";

const REDIS_PREFIX = `stitcher:session`;

const key = (sessionId: string) => `${REDIS_PREFIX}:${sessionId}`;

export async function createSession(data: { url: string; vmapUrl?: string }) {
  const sessionId = randomUUID();

  let ads: Ad[] = [];
  if (data.vmapUrl) {
    ads = await resolveVmap(data.vmapUrl);
  }

  const session = {
    id: sessionId,
    url: data.url,
    ads,
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
