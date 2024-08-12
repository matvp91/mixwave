import { dirSync } from "tmp";
import { readFile } from "fs/promises";
import { once } from "events";
import { lookup } from "mime-types";
import { fork } from "child_process";
import { createRequire } from "node:module";
import { by639_2T } from "iso-language-codes";
import { downloadFolder, uploadFolder } from "../s3.js";
import parseFilePath from "parse-filepath";
import * as z from "zod";
import { streamSchema } from "../../schemas.js";
import type { Job } from "bullmq";
import type { Code } from "iso-language-codes";

const metaSchema = z.record(z.string(), streamSchema);

export type PackageData = {
  assetId: string;
};

export type PackageResult = {
  assetId: string;
};

function formatLanguage(code: Code) {
  return code.name.split(",")[0].toUpperCase();
}

export default async function (job: Job<PackageData, PackageResult>) {
  const dir = dirSync();
  await downloadFolder(dir.name, `transcode/${job.data.assetId}`);

  const metaFile = await metaSchema.parseAsync(
    JSON.parse(await readFile(`${dir.name}/meta.json`, "utf8")),
  );

  const outDir = dirSync();

  const params: string[][] = [];

  for (const key of Object.keys(metaFile)) {
    const stream = metaFile[key];
    const file = parseFilePath(key);

    if (stream.type === "video") {
      params.push([
        `in=${dir.name}/${key}`,
        "stream=video",
        `init_segment=${file.name}/init.mp4`,
        `segment_template=${file.name}/$Number$.m4s`,
        `playlist_name=${file.name}/playlist.m3u8`,
        `iframe_playlist_name=${file.name}/iframe.m3u8`,
      ]);
    }

    if (stream.type === "audio") {
      params.push([
        `in=${dir.name}/${key}`,
        "stream=audio",
        `init_segment=${file.name}/init.mp4`,
        `segment_template=${file.name}/$Number$.m4a`,
        `playlist_name=${file.name}/playlist.m3u8`,
        "hls_group_id=audio",
        `hls_name=${formatLanguage(by639_2T[stream.language])}`,
      ]);
    }

    if (stream.type === "text") {
      params.push([
        `in=${dir.name}/${key}`,
        "stream=text",
        `segment_template=${file.name}/$Number$.vtt`,
        `playlist_name=${file.name}/playlist.m3u8`,
        "hls_group_id=text",
        `hls_name=${formatLanguage(by639_2T[stream.language])}`,
      ]);
    }
  }

  const packagerArgs = params.map((it) => `${it.join(",")}`);

  packagerArgs.push(
    "--segment_duration",
    "4",
    "--fragment_duration",
    "4",
    "--hls_master_playlist_output",
    "master.m3u8",
  );

  const fakeRequire = createRequire(import.meta.url);
  const packagerBin = await fakeRequire.resolve("shaka-packager");

  const packagerProcess = fork(packagerBin, packagerArgs, {
    stdio: "inherit",
    cwd: outDir.name,
    detached: false,
  });

  // let outputStr = "";
  // packagerProcess.stdout?.on("data", (chunk) => {
  //   outputStr += chunk.toString();
  // });

  await once(packagerProcess, "close");

  // if (!outputStr.includes("Packaging completed")) {
  //   throw new Error("Failed to package");
  // }

  await uploadFolder(outDir.name, `package/${job.data.assetId}/hls`, {
    del: true,
    commandInput: (input) => ({
      ContentType: lookup(input.Key) || "binary/octet-stream",
      ACL: "public-read",
    }),
  });

  job.updateProgress(100);

  return {
    assetId: job.data.assetId,
  };
}
