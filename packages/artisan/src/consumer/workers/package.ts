import { execa } from "execa";
import { lookup } from "mime-types";
import { by639_2T } from "iso-language-codes";
import parseFilePath from "parse-filepath";
import { downloadFolder, uploadFolder } from "../s3";
import { TmpDir } from "../tmp-dir";
import { getMetaFile } from "../meta-file";
import { getBinaryPath } from "../helpers";
import type { Job } from "bullmq";
import type { Code } from "iso-language-codes";
import type { Stream } from "../../types";

const packagerBin = await getBinaryPath("packager");

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
        `hls_group_id=${getGroupId(stream)}`,
        `hls_name=${getName(stream)}`,
        `language=${stream.language}`,
      ]);
    }

    if (stream.type === "text") {
      packagerParams.push([
        `in=${inDir}/${key}`,
        "stream=text",
        `segment_template=${file.name}/$Number$.vtt`,
        `playlist_name=${file.name}/playlist.m3u8`,
        `hls_group_id=${getGroupId(stream)}`,
        `hls_name=${getName(stream)}`,
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

  job.log(packagerArgs.join("\n"));

  await execa(packagerBin, packagerArgs, {
    stdio: "inherit",
    cwd: outDir,
    detached: false,
  });

  const s3Dir = `package/${params.assetId}/${params.name}`;
  job.log(`Uploading to ${s3Dir}`);

  await uploadFolder(outDir, s3Dir, {
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

function getGroupId(
  stream:
    | Extract<Stream, { type: "audio" }>
    | Extract<Stream, { type: "text" }>,
) {
  if (stream.type === "audio") {
    // When we package audio, we split codecs into a separate group.
    // The CODECS attribute would else include "ac-3,mp4a.40.2", which will
    // make HLS players fail as each CODECS attribute is needs to pass the
    // method |isTypeSupported| on MSE.
    return `audio_${stream.codec}`;
  }
  if (stream.type === "text") {
    return `text`;
  }
}

function getName(
  stream:
    | Extract<Stream, { type: "audio" }>
    | Extract<Stream, { type: "text" }>,
) {
  if (stream.type === "audio") {
    return `${stream.language}_${stream.codec}`;
  }
  if (stream.type === "text") {
    return `${stream.language}`;
  }
}

export default async function (job: Job<PackageData, PackageResult>) {
  const tmpDir = new TmpDir();
  try {
    return await runJob(job, tmpDir);
  } finally {
    await tmpDir.deleteAll();
  }
}
