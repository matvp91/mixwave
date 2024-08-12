import fastifyPlugin from "fastify-plugin";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { FastifyAdapter } from "@bull-board/fastify";
import { createBullBoard } from "@bull-board/api";
import { allQueus } from "@mixwave/artisan/producer";

export const bullBoardPlugin = fastifyPlugin(async (app) => {
  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: allQueus.map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });

  serverAdapter.setBasePath("/ui");

  await app.register(serverAdapter.registerPlugin(), {
    basePath: "/ui",
    prefix: "/ui",
  });
});
