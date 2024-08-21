import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { contract } from "./contract.js";
import { initServer } from "@ts-rest/fastify";
import { generateOpenApi } from "@ts-rest/open-api";
import { createSession, getSession } from "./session.js";
import { parseVmap } from "./vmap.js";
import {
  formatMasterPlaylist,
  formatMediaPlaylist,
  formatInterstitialsJson,
} from "./playlist.js";
import parseFilepath from "parse-filepath";

async function buildServer() {
  const app = Fastify();

  app.register(cors);

  const s = initServer();

  const router = s.router(contract, {
    postSession: async ({ request, body }) => {
      const sessionId = createSession({
        url: body.url,
      });

      if (body.vmapUrl) {
        await parseVmap(sessionId, body.vmapUrl);
      }

      return {
        status: 200,
        body: {
          url: `${request.protocol}://${request.hostname}/session/${sessionId}/master.m3u8`,
        },
      };
    },
    getMasterPlaylist: async ({ params, reply }) => {
      const sessionData = getSession(params.sessionId);
      const response = await formatMasterPlaylist(sessionData.url);

      reply.type("application/x-mpegURL");

      return {
        status: 200,
        body: response,
      };
    },
    getMediaPlaylist: async ({ params, reply }) => {
      const sessionData = getSession(params.sessionId);
      const filePath = parseFilepath(sessionData.url);

      const response = await formatMediaPlaylist(
        `${filePath.dir}/${params.path}/playlist.m3u8`,
        params.sessionId,
      );

      reply.type("application/x-mpegURL");

      return {
        status: 200,
        body: response,
      };
    },
    getInterstitialsList: async ({ query, params }) => {
      return {
        status: 200,
        body: await formatInterstitialsJson(params.sessionId, query.offset),
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

  await app.listen({ port: env.PORT });
}

main();
