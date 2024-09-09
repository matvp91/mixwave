import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { contract } from "./contract.js";
import { initServer } from "@ts-rest/fastify";
import { generateOpenApi } from "@ts-rest/open-api";
import { createSession, getSession } from "./session.js";
import {
  formatMasterPlaylist,
  formatMediaPlaylist,
  formatAssetList,
} from "./playlist.js";

async function buildServer() {
  const app = Fastify();

  app.register(cors);

  const s = initServer();

  const router = s.router(contract, {
    postSession: async ({ request, body }) => {
      const session = await createSession(body);
      const baseUrl =
        env.STITCHER_BASE_URL ?? `${request.protocol}://${request.hostname}`;

      return {
        status: 200,
        body: {
          url: `${baseUrl}/session/${session.id}/master.m3u8`,
          session,
        },
      };
    },
    getDirectMasterPlaylist: async ({ request, params, query, reply }) => {
      const body = {
        assetId: params.assetId,
        // Use params from base64 payload first.
        ...query.params,
        // Overwrite them with query params.
        ...query,
      };

      const session = await createSession(body);

      const baseUrl =
        env.STITCHER_BASE_URL ?? `${request.protocol}://${request.hostname}`;

      return reply.redirect(
        `${baseUrl}/session/${session.id}/master.m3u8`,
        302,
      );
    },
    getMasterPlaylist: async ({ params, reply }) => {
      const session = await getSession(params.sessionId);
      const response = await formatMasterPlaylist(session);

      return reply.type("application/x-mpegURL").send(response);
    },
    getMediaPlaylist: async ({ params, reply }) => {
      const session = await getSession(params.sessionId);
      const response = await formatMediaPlaylist(session, params.path);

      return reply.type("application/x-mpegURL").send(response);
    },
    getAssetList: async ({ query, params }) => {
      const session = await getSession(params.sessionId);

      return {
        status: 200,
        body: await formatAssetList(session, query.timeOffset),
      };
    },
    getSpec: async () => {
      return {
        status: 200,
        body: generateOpenApi(contract, {
          info: {
            title: "Stitcher",
            version: "1.0.0",
          },
        }),
      };
    },
  });

  app.register(s.plugin(router));

  return app;
}

async function main() {
  const app = await buildServer();

  await app.listen({ host: env.HOST, port: env.PORT });
}

main();
