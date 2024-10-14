import { Worker } from "bullmq";
import { connection } from "../env";
import transcodeFn from "./transcode";
import packageFn from "./package";
import ffmpegFn from "./ffmpeg";

const workers = [
  new Worker("transcode", transcodeFn, { connection, autorun: false }),
  new Worker("package", packageFn, { connection, autorun: false }),
  new Worker("ffmpeg", ffmpegFn, { connection, autorun: false }),
];

async function gracefulShutdown() {
  for (const worker of workers) {
    if (!worker.isRunning()) {
      continue;
    }
    await worker.close();
  }
  process.exit(0);
}

process
  .on("beforeExit", gracefulShutdown)
  .on("SIGINT", gracefulShutdown)
  .on("SIGTERM", gracefulShutdown);

export async function startWorkers() {
  workers.forEach((worker) => {
    worker.run();
    console.log(`Started worker "${worker.name}"`);
  });
}
