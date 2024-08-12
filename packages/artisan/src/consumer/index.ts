import { Worker } from "bullmq";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { connection } from "../connection.js";

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
