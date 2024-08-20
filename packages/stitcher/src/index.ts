import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { randomUUID } from "crypto";
import { formatMasterPlaylist, formatMediaPlaylist } from "./playlist.js";
import * as z from "zod";
import pnc from "persistent-node-cache";
import parseFilepath from "parse-filepath";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { playlistParamsSchema } from "./schemas.js";
import type { PlaylistParams } from "./schemas.js";

const cache = new pnc.PersistentNodeCache("stitcher");

async function buildServer() {
  const app = Fastify();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors);

  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: "post",
      url: "/",
      schema: {
        body: playlistParamsSchema,
      },
      handler: (request, reply) => {
        const sessionId = randomUUID();

        cache.set(sessionId, request.body, 1000 * 60 * 60 * 24);

        reply.send({
          url: `${request.protocol}://${request.hostname}/session/${sessionId}/master.m3u8`,
        });
      },
    })
    .route({
      method: "get",
      url: "/session/:sessionId/master.m3u8",
      schema: {
        params: z.object({
          sessionId: z.string(),
        }),
      },
      handler: async (request, reply) => {
        const session = cache.get<PlaylistParams>(request.params.sessionId)!;

        const response = await formatMasterPlaylist(session.url);

        reply.type("application/x-mpegURL").send(response);
      },
    })
    .route({
      method: "get",
      url: "/session/:sessionId/:path/playlist.m3u8",
      schema: {
        params: z.object({
          sessionId: z.string(),
          path: z.string(),
        }),
      },
      handler: async (request, reply) => {
        const session = cache.get<PlaylistParams>(request.params.sessionId)!;
        const filePath = parseFilepath(session.url);

        const response = await formatMediaPlaylist(
          `${filePath.dir}/${request.params.path}/playlist.m3u8`,
          session,
        );

        reply.type("application/x-mpegURL").send(response);
      },
    });

  return app;
}

async function main() {
  const app = await buildServer();

  await app.listen({ port: env.PORT });
}

main();
