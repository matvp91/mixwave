import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { contract } from "./contract.js";
import { initServer } from "@ts-rest/fastify";
import { openApiSpec } from "./openapi.js";
import { createSession } from "./session.js";
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
    postSession: async ({ body }) => {
      const session = await createSession(body);
      return {
        status: 200,
        body: {
          url: `${env.PUBLIC_STITCHER_ENDPOINT}/session/${session.id}/master.m3u8`,
          session,
        },
      };
    },
    getMasterPlaylist: async ({ params, reply }) => {
      const response = await formatMasterPlaylist(params.sessionId);

      // return reply.type("application/x-mpegURL").send(response);
      return reply.send(response);
    },
    getMediaPlaylist: async ({ params, reply }) => {
      const response = await formatMediaPlaylist(params.sessionId, params["*"]);

      // return reply.type("application/x-mpegURL").send(response);
      return reply.send(response);
    },
    getAssetList: async ({ query }) => {
      return {
        status: 200,
        body: await formatAssetList(query.sessionId, query.startDate),
      };
    },
    getSpec: async () => {
      return {
        status: 200,
        body: openApiSpec,
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
