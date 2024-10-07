import { client } from "./redis.js";
import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { SessionNotFoundError } from "./errors.js";
import type { VmapResponse } from "./vmap.js";

export type Session = {
  id: string;
  uri: string;
  dt: DateTime;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
  vmapResponse?: VmapResponse;
};

export type SessionInterstitialType = "ad" | "bumper";

export type SessionInterstitial = {
  timeOffset: number;
  uri: string;
  type?: SessionInterstitialType;
};

export type SessionFilter = {
  resolution?: string;
};

export type SessionVmap = {
  url: string;
};

const REDIS_PREFIX = `stitcher:session`;

function redisKey(sessionId: string) {
  return `${REDIS_PREFIX}:${sessionId}`;
}

export async function createSession(data: {
  uri: string;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
}) {
  const sessionId = randomUUID();

  const session: Session = {
    id: sessionId,
    uri: data.uri,
    filter: data.filter,
    interstitials: data.interstitials,
    vmap: data.vmap,
    dt: DateTime.now(),
  };

  const key = redisKey(sessionId);

  await client.set(key, serializeToJson(session), {
    EX: 60 * 60 * 6,
  });

  return session;
}

export async function getSession(sessionId: string) {
  const data = await client.get(redisKey(sessionId));

  if (!data) {
    throw new SessionNotFoundError(sessionId);
  }

  if (typeof data !== "string") {
    throw new SyntaxError(
      "Redis did not return a string for session, cannot deserialize.",
    );
  }

  return parseFromJson(data);
}

export async function updateSession(session: Session) {
  const key = redisKey(session.id);
  await client.set(key, serializeToJson(session), {
    EX: await client.ttl(key),
  });
}

function serializeToJson(session: Session) {
  return JSON.stringify({
    ...session,
    dt: session.dt.toISO(),
  });
}

function parseFromJson(text: string): Session {
  const obj = JSON.parse(text);
  return {
    ...obj,
    dt: DateTime.fromISO(obj.dt),
  };
}
