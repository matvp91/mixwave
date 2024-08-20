import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { packageBaseUrl } from "./const.js";
import { randomUUID } from "crypto";
import { masterPlaylist, mediaPlaylist } from "./playlist.js";
import pnc from "persistent-node-cache";

const cache = new pnc.PersistentNodeCache("stitcher");

async function buildServer() {
  const app = Fastify();

  app.register(cors);

  app.get<{
    Params: {
      sessionId: string;
    };
  }>("/hls/:sessionId/master.m3u8", async (request, reply) => {
    const session = cache.get<{ assetId: string }>(request.params.sessionId);
    if (!session) {
      throw new Error("missing session");
    }

    const response = await masterPlaylist(
      `${packageBaseUrl}/${session.assetId}/hls/master.m3u8`,
    );

    reply.type("application/x-mpegURL").send(response);
  });

  app.get<{
    Params: {
      sessionId: string;
      path: string;
    };
  }>("/hls/:sessionId/:path/playlist.m3u8", async (request, reply) => {
    const session = cache.get<{ assetId: string }>(request.params.sessionId);
    if (!session) {
      throw new Error("missing session");
    }

    const response = await mediaPlaylist(
      `${packageBaseUrl}/${session.assetId}/hls/${request.params.path}/playlist.m3u8`,
    );

    reply.type("application/x-mpegURL").send(response);
  });

  app.get("/", (request, reply) => {
    const assetId = "010d2293-e793-480a-9504-faf68d5ef0df";
    const sessionId = randomUUID();

    cache.set(
      sessionId,
      {
        assetId,
      },
      1000 * 60 * 60 * 24,
    );

    reply.send({
      url: `${env.HOST}/hls/${sessionId}/master.m3u8`,
    });
  });

  return app;
}

async function main() {
  const app = await buildServer();

  await app.listen({ port: env.PORT });
}

main();
