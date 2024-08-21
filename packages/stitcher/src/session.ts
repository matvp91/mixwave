import cacheLib from "persistent-node-cache";
import { randomUUID } from "crypto";

const { PersistentNodeCache } = cacheLib;

const cache = new PersistentNodeCache("stitcher__session");

type SessionData = {
  url: string;
};

export function createSession(data: SessionData) {
  const sessionId = randomUUID();

  cache.set(sessionId, data, 1000 * 60 * 60 * 24);

  return sessionId;
}

export function getSession(id: string) {
  const sessionData = cache.get<SessionData>(id);
  if (!sessionData) {
    throw new Error("No session found for id");
  }
  return sessionData;
}
