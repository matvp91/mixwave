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

  await client.json.set(key(sessionId), `$`, {
    url: data.url,
    ads,
  } satisfies Session);

  await client.expire(key(sessionId), 60 * 60 * 6);

  return sessionId;
}

export async function getSessionData(sessionId: string) {
  const [data] = (await client.json.get(key(sessionId), {
    path: ["$.data"],
  })) as [SessionData | undefined];
  return data;
}

export async function getSessionAds(sessionId: string) {
  const [data] = (await client.json.get(key(sessionId), {
    path: ["$.ads"],
  })) as [SessionAd[] | undefined];
  return data;
}

export async function setSessionAds(sessionId: string, ads: SessionAd[]) {
  await client.json.set(key(sessionId), "$.ads", ads);
}
