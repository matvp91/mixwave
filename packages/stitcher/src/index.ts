import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { env } from "./env";
import { createSession } from "./session";
import { validateFilter } from "./filters";
import { getMasterUrl } from "./url";
import {
  formatMasterPlaylist,
  formatMediaPlaylist,
  formatAssetList,
} from "./playlist";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .post(
    "/session",
    async ({ body }) => {
      // This'll fail when uri is invalid.
      getMasterUrl(body.uri);

      if (body.filter) {
        // When we have a filter, validate it here first. There is no need to wait until we approach
        // the master playlist. We can bail out early.
        validateFilter(body.filter);
      }

      const session = await createSession(body);

      return {
        url: `${env.PUBLIC_STITCHER_ENDPOINT}/session/${session.id}/master.m3u8`,
      };
    },
    {
      body: t.Object({
        uri: t.String(),
        interstitials: t.Optional(
          t.Array(
            t.Object({
              timeOffset: t.Number(),
              uri: t.String(),
              type: t.Optional(t.Union([t.Literal("ad"), t.Literal("bumper")])),
            }),
          ),
        ),
        filter: t.Optional(
          t.Object({
            resolution: t.Optional(t.String()),
          }),
        ),
        vmap: t.Optional(
          t.Object({
            url: t.String(),
          }),
        ),
      }),
    },
  )
  .get(
    "/session/:sessionId/master.m3u8",
    async ({ set, params }) => {
      const playlist = await formatMasterPlaylist(params.sessionId);
      set.headers["content-type"] = "application/x-mpegURL";
      return playlist;
    },
    {
      params: t.Object({
        sessionId: t.String(),
      }),
    },
  )
  .get(
    "/session/:sessionId/*",
    async ({ set, params }) => {
      const playlist = await formatMediaPlaylist(params.sessionId, params["*"]);
      set.headers["content-type"] = "application/x-mpegURL";
      return playlist;
    },
    {
      params: t.Object({
        sessionId: t.String(),
        "*": t.String(),
      }),
    },
  )
  .get(
    "/session/:sessionId/asset-list.json",
    async ({ params, query }) => {
      return await formatAssetList(params.sessionId, query.startDate);
    },
    {
      params: t.Object({
        sessionId: t.String(),
      }),
      query: t.Object({
        startDate: t.String(),
      }),
    },
  );

app.listen({
  port: env.PORT,
  hostname: env.HOST,
});
