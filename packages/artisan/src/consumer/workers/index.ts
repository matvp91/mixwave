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

export function startWorkers() {
  workers.forEach((worker) => {
    worker.run();
  });
  console.log(`Started ${workers.length} workers.`);
}
