import { once } from "events";
import { lookup } from "mime-types";
import { fork } from "child_process";
import { createRequire } from "node:module";
import { by639_2T } from "iso-language-codes";
import { downloadFolder, uploadFolder } from "../s3";
import parseFilePath from "parse-filepath";
import { TmpDir } from "../tmp-dir";
import { getMetaFile } from "../meta-file";
import type { Job } from "bullmq";
import type { Code } from "iso-language-codes";

export type PackageData = {
  params: {
    assetId: string;
    segmentSize?: number;
    name: string;
  };
  metadata: {
    tag?: string;
  };
};

export type PackageResult = {
  assetId: string;
};

function formatLanguage(code: Code) {
  return code.name.split(",")[0].toUpperCase();
}

async function runJob(
  job: Job<PackageData, PackageResult>,
  tmpDir: TmpDir,
): Promise<PackageResult> {
  const { params } = job.data;

  const inDir = await tmpDir.create();
  await downloadFolder(`transcode/${params.assetId}`, inDir);

  job.log(`Synced folder in ${inDir}`);

  const metaFile = await getMetaFile(inDir);

  job.log(`Got meta file: "${JSON.stringify(metaFile)}"`);

  // If we do not specify the segmentSize, grab it from the meta file.
  const segmentSize = params.segmentSize ?? metaFile.segmentSize;

  const outDir = await tmpDir.create();

  const packagerParams: string[][] = [];

  for (const key of Object.keys(metaFile.streams)) {
    const stream = metaFile.streams[key];
    const file = parseFilePath(key);

    if (stream.type === "video") {
      packagerParams.push([
        `in=${inDir}/${key}`,
        "stream=video",
        `init_segment=${file.name}/init.mp4`,
        `segment_template=${file.name}/$Number$.m4s`,
        `playlist_name=${file.name}/playlist.m3u8`,
        `iframe_playlist_name=${file.name}/iframe.m3u8`,
      ]);
    }

    if (stream.type === "audio") {
      packagerParams.push([
        `in=${inDir}/${key}`,
        "stream=audio",
        `init_segment=${file.name}/init.mp4`,
        `segment_template=${file.name}/$Number$.m4a`,
        `playlist_name=${file.name}/playlist.m3u8`,
        "hls_group_id=audio",
        `hls_name=${formatLanguage(by639_2T[stream.language])}`,
      ]);
    }

    if (stream.type === "text") {
      packagerParams.push([
        `in=${inDir}/${key}`,
        "stream=text",
        `segment_template=${file.name}/$Number$.vtt`,
        `playlist_name=${file.name}/playlist.m3u8`,
        "hls_group_id=text",
        `hls_name=${formatLanguage(by639_2T[stream.language])}`,
      ]);
    }
  }

  const packagerArgs = packagerParams.map((it) => `${it.join(",")}`);

  packagerArgs.push(
    "--segment_duration",
    segmentSize.toString(),
    "--fragment_duration",
    segmentSize.toString(),
    "--hls_master_playlist_output",
    "master.m3u8",
  );

  const fakeRequire = createRequire(import.meta.url);
  const packagerBin = await fakeRequire.resolve("shaka-packager");

  job.log(packagerArgs.join("\n"));

  const packagerProcess = fork(packagerBin, packagerArgs, {
    stdio: "inherit",
    cwd: outDir,
    detached: false,
  });

  await once(packagerProcess, "close");

  await uploadFolder(outDir, `package/${params.assetId}/${params.name}`, {
    del: true,
    commandInput: (input) => ({
      ContentType: lookup(input.Key) || "binary/octet-stream",
      ACL: "public-read",
    }),
  });

  job.updateProgress(100);

  return {
    assetId: params.assetId,
  };
}

export default async function (job: Job<PackageData, PackageResult>) {
  const tmpDir = new TmpDir();
  try {
    return await runJob(job, tmpDir);
  } finally {
    await tmpDir.deleteAll();
  }
}
