import Fastify from "fastify";
import cors from "@fastify/cors";
import { initServer } from "@ts-rest/fastify";
import { env } from "./env";
import { contract } from "./contract";
import { openApiSpec } from "./openapi";
import { createSession } from "./session";
import { validateFilter } from "./filters";
import { getMasterUrl } from "./url";
import {
  formatMasterPlaylist,
  formatMediaPlaylist,
  formatAssetList,
} from "./playlist";

async function buildServer() {
  const app = Fastify();

  app.register(cors);

  const s = initServer();

  const router = s.router(contract, {
    postSession: async ({ body }) => {
      // This'll fail when uri is invalid.
      getMasterUrl(body.uri);

      if (body.filter) {
        // When we have a filter, validate it here first. There is no need to wait until we approach
        // the master playlist. We can bail out early.
        validateFilter(body.filter);
      }

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
      return reply.type("application/x-mpegURL").send(response);
    },
    getMediaPlaylist: async ({ params, reply }) => {
      const response = await formatMediaPlaylist(params.sessionId, params["*"]);
      return reply.type("application/x-mpegURL").send(response);
    },
    getAssetList: async ({ query, params }) => {
      return {
        status: 200,
        body: await formatAssetList(params.sessionId, query.startDate),
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
