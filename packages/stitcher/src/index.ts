import Fastify from "fastify";
import fastifyProxy from "@fastify/http-proxy";
import cors from "@fastify/cors";
import { parsePlaylistParamsPayload } from "./schemas.js";
import { parse, stringify } from "../extern/hls-parser/index.js";
import { Define, Interstitial } from "../extern/hls-parser/types.js";
import { env } from "./env.js";
import type {
  MasterPlaylist,
  MediaPlaylist,
} from "../extern/hls-parser/types.js";
import type {
  FastifyReply,
  FastifyRequest,
  preValidationAsyncHookHandler,
} from "fastify";

const packageUrl = `${env.S3_PUBLIC_URL}/package`;

function parseUrl(fullUrl: string) {
  const [url] = fullUrl.split(/[?#]/);
  return url.replace("out/", "");
}

async function fetchPlaylist<T>(url: string) {
  const response = await fetch(`${packageUrl}${url}`);
  const text = await response.text();
  return parse(text) as T;
}

const preValidation = async (
  request: FastifyRequest<{
    Querystring: {
      p?: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const url = parseUrl(request.url);
  const now = Date.now();

  if (url.endsWith("master.m3u8")) {
    const playlist = await fetchPlaylist<MasterPlaylist>(url);

    playlist.defines.push(
      new Define({
        value: "p",
        type: "QUERYPARAM",
      }),
      new Define({
        name: "basePath",
        value: packageUrl,
        type: "NAME",
      }),
    );

    playlist.variants.forEach((variant) => {
      variant.uri = `${variant.uri}?p={$p}`;

      variant.audio.forEach((audioTrack) => {
        audioTrack.uri = `${audioTrack.uri}?p={$p}`;
      });
    });

    reply.type("application/x-mpegURL").send(stringify(playlist));
  }

  if (url.endsWith("playlist.m3u8")) {
    const playlist = await fetchPlaylist<MediaPlaylist>(url);

    const playlistParams = parsePlaylistParamsPayload(request.query.p);

    if (playlistParams.interstitials) {
      playlist.segments[0].programDateTime = new Date(now);

      playlistParams.interstitials.forEach((interstitial, index) => {
        playlist.interstitials.push(
          new Interstitial({
            startDate: new Date(now),
            id: `i${index + 1}`,
            uri: `${packageUrl}/${interstitial.assetId}/hls/master.m3u8`,
            duration: 15,
          }),
        );
      });
    }

    if (playlistParams.origSegmentUri) {
      // TODO: Write path tools to strip filename from full path, and work on terminology.
      const subPath = url.replace("/playlist.m3u8", "");

      playlist.defines.push(
        new Define({
          value: "basePath",
          type: "IMPORT",
        }),
        new Define({
          name: "path",
          value: `{$basePath}${subPath}`,
          type: "NAME",
        }),
      );

      playlist.segments.forEach((segment) => {
        segment.uri = `{$path}/${segment.uri}`;
      });
    }

    reply.type("application/x-mpegURL").send(stringify(playlist));
  }
};

async function buildServer() {
  const app = Fastify();

  app.register(cors);

  app.register(fastifyProxy, {
    upstream: packageUrl,
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
