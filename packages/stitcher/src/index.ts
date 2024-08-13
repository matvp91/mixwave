import Fastify from "fastify";
import fastifyProxy from "@fastify/http-proxy";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { getMasterPlaylist, getMediaPlaylist } from "./playlist.js";
import { packageBaseUrl } from "./const.js";
import type {
  FastifyReply,
  FastifyRequest,
  preValidationAsyncHookHandler,
} from "fastify";

function parsePath(path: string) {
  // Remove querystring
  const [pathNoQuery] = path.split(/[?#]/);
  // Remove /out/ prefix
  return pathNoQuery.replace("/out/", "");
}

const preValidation = async (
  request: FastifyRequest<{
    Querystring: {
      p?: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const path = parsePath(request.url);

  if (path.endsWith("master.m3u8")) {
    const playlistText = await getMasterPlaylist(path);
    reply.type("application/x-mpegURL").send(playlistText);
  }

  if (path.endsWith("playlist.m3u8")) {
    const playlistText = await getMediaPlaylist(path, request.query);
    reply.type("application/x-mpegURL").send(playlistText);
  }
};

async function buildServer() {
  const app = Fastify();

  app.register(cors);

  app.register(fastifyProxy, {
    upstream: packageBaseUrl,
    prefix: "/out",
    preValidation: preValidation as preValidationAsyncHookHandler,
  });

  return app;
}

async function main() {
  const app = await buildServer();

  await app.listen({ port: env.PORT });
}

main();
