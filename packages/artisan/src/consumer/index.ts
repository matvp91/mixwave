import { Worker } from "bullmq";
import { dirname } from "path";
import { fileURLToPath } from "url";

let port = 6379;
if (process.env.REDIS_PORT) {
  port = +process.env.REDIS_PORT;
}

export const connection = {
  host: process.env.REDIS_HOST,
  port,
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
