import { Worker } from "bullmq";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { env } from "./env.js";

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

const fileName = fileURLToPath(import.meta.url);

new Worker("transcode", `${dirname(fileName)}/workers/transcode.js`, {
  connection,
});

new Worker("package", `${dirname(fileName)}/workers/package.js`, {
  connection,
});

new Worker("ffmpeg", `${dirname(fileName)}/workers/ffmpeg.js`, {
  connection,
});

console.log("Started workers...");
