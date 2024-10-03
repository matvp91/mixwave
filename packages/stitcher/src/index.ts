import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { contract } from "./contract.js";
import { initServer } from "@ts-rest/fastify";
import { openApiSpec } from "./openapi.js";
import { createSession, getSession } from "./session.js";
import {
  formatMasterPlaylist,
  formatMediaPlaylist,
  formatAssetList,
} from "./playlist.js";
import { getMasterPlaylist, getMediaPlaylist } from "./fast/index.js";

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
      const session = await getSession(params.sessionId);
      const response = await formatMasterPlaylist(session);

      // return reply.type("application/x-mpegURL").send(response);
      return reply.send(response);
    },
    getMediaPlaylist: async ({ params, reply }) => {
      const session = await getSession(params.sessionId);
      const response = await formatMediaPlaylist(session, params["*"]);

      // return reply.type("application/x-mpegURL").send(response);
      return reply.send(response);
    },
    getAssetList: async ({ query, params }) => {
      const session = await getSession(params.sessionId);

      return {
        status: 200,
        body: await formatAssetList(session, query.timeOffset),
      };
    },
    unstable_getFastMasterPlaylist: async () => {
      return {
        status: 200,
        body: await getMasterPlaylist(),
      };
    },
    unstable_getFastMediaPlaylist: async ({ params }) => {
      return {
        status: 200,
        body: await getMediaPlaylist(params["*"]),
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

// TODO: Remove
import "./parser/index.js";
