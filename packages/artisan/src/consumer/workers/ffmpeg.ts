import parseFilePath from "parse-filepath";
import { FFmpeggy } from "ffmpeggy";
import { downloadFile, uploadFile } from "../s3";
import { TmpDir } from "../tmp-dir";
import { getBinaryPath } from "../helpers";
import { JOB_SKIPPED } from "./helpers";
import type { FFprobeResult } from "ffmpeggy";
import type { Job } from "bullmq";
import type { Stream, Input } from "../../types";
import type { SkippableJobResult } from "./helpers";

const ffmpegBin = await getBinaryPath("ffmpeg");
const ffprobeBin = await getBinaryPath("ffprobe");

FFmpeggy.DefaultConfig = {
  ...FFmpeggy.DefaultConfig,
  ffmpegBin,
  ffprobeBin,
};

export type FfmpegData = {
  params: {
    input: Input;
    stream: Stream;
    segmentSize: number;
    assetId: string;
  };
  metadata: {
    parentSortKey: number;
  };
};

export type FfmpegResult = SkippableJobResult<{
  name: string;
  stream: Stream;
}>;

async function runJob(
  job: Job<FfmpegData, FfmpegResult>,
  tmpDir: TmpDir,
): Promise<FfmpegResult> {
  const { params } = job.data;

  const outDir = await tmpDir.create();

  const inputFile = await prepareInput(job, tmpDir, params.input);

  job.log(`Input is ${inputFile.path}`);

  const ffmpeg = new FFmpeggy({
    input: inputFile.path,
    globalOptions: ["-loglevel error"],
  });

  let name: string | undefined;

  const outputOptions: string[] = [];

  if (params.stream.type === "video") {
    const inputInfo = await FFmpeggy.probe(inputFile.path);
    job.log(`Probed info (${JSON.stringify(inputInfo)})`);

    const maxHeight = getMaxHeight(inputInfo);

    if (maxHeight > 0 && params.stream.height > maxHeight) {
      job.log(
        `Skip upscale, requested ${params.stream.height} is larger than input ${maxHeight}`,
      );
      return JOB_SKIPPED;
    }

    name = `video_${params.stream.height}_${params.stream.bitrate}_${params.stream.codec}.m4v`;
    outputOptions.push(
      ...getVideoOutputOptions(params.stream, params.segmentSize),
    );
  }

  if (params.stream.type === "audio") {
    name = `audio_${params.stream.language}_${params.stream.bitrate}_${params.stream.codec}.m4a`;
    outputOptions.push(
      ...getAudioOutputOptions(params.stream, params.segmentSize),
    );
  }

  if (params.stream.type === "text") {
    name = `text_${params.stream.language}.vtt`;
    outputOptions.push(...getTextOutputOptions());
  }

  if (!name) {
    throw new Error(
      "Missing name, this is most likely a bug. Report it, please.",
    );
  }

  ffmpeg.setOutput(`${outDir}/${name}`);
  ffmpeg.setOutputOptions(outputOptions);

  job.log(`Transcode to ${name}`);

  ffmpeg.on("start", (args) => {
    job.log(args.join(" "));
  });

  ffmpeg.on("progress", (event) => {
    job.updateProgress(event.percent ?? 0);
  });

  ffmpeg.run();

  await ffmpeg.done();

  job.updateProgress(100);

  job.log(`Uploading ${outDir}/${name} to transcode/${params.assetId}/${name}`);

  await uploadFile(`transcode/${params.assetId}/${name}`, `${outDir}/${name}`);

  return {
    name,
    stream: params.stream,
  };
}

export default async function (job: Job<FfmpegData, FfmpegResult>) {
  const tmpDir = new TmpDir();
  try {
    return await runJob(job, tmpDir);
  } finally {
    await tmpDir.deleteAll();
  }
}

function getVideoOutputOptions(
  stream: Extract<Stream, { type: "video" }>,
  segmentSize: number,
) {
  const keyFrameRate = segmentSize * stream.framerate;

  const args: string[] = [
    "-f mp4",
    "-an",
    `-c:v ${stream.codec}`,
    `-b:v ${stream.bitrate}`,
    `-r ${stream.framerate}`,
    "-movflags +frag_keyframe",
    `-frag_duration ${segmentSize * 1_000_000}`,
    `-keyint_min ${keyFrameRate}`,
    `-g ${keyFrameRate}`,
  ];

  if (stream.codec === "h264") {
    let profile = "main";
    if (stream.height >= 720) {
      profile = "high";
    }
    args.push(`-profile:v ${profile}`);
  }

  if (stream.codec === "h264" || stream.codec === "hevc") {
    args.push(
      "-preset slow",
      "-flags +loop",
      "-pix_fmt yuv420p",
      "-flags +cgop",
    );
  }

  const filters: string[] = ["setsar=1:1", `scale=-2:${stream.height}`];

  if (filters.length) {
    args.push(`-vf ${filters.join(",")}`);
  }

  return args;
}

function getAudioOutputOptions(
  stream: Extract<Stream, { type: "audio" }>,
  segmentSize: number,
) {
  const args: string[] = [
    "-f mp4",
    "-vn",
    `-ac ${stream.channels}`,
    `-c:a ${stream.codec}`,
    `-b:a ${stream.bitrate}`,
    `-frag_duration ${segmentSize * 1_000_000}`,
    `-metadata language=${stream.language}`,
    "-strict experimental",
  ];

  const filters: string[] = [];
  if (stream.channels === 6) {
    filters.push("channelmap=channel_layout=5.1");
  }

  if (filters.length) {
    args.push(`-af ${filters.join(",")}`);
  }

  return args;
}

function getTextOutputOptions() {
  const args: string[] = ["-f webvtt"];
  return args;
}

function getMaxHeight(info: FFprobeResult) {
  return info.streams.reduce<number>((acc, stream) => {
    if (!stream.height) {
      return acc;
    }
    return acc > stream.height ? acc : stream.height;
  }, 0);
}

async function prepareInput(job: Job, tmpDir: TmpDir, input: Input) {
  const filePath = parseFilePath(input.path);

  // If the input is on S3, download the file locally.
  if (filePath.dir.startsWith("s3://")) {
    const inDir = await tmpDir.create();

    job.log(`Download "${filePath.path}" to "${inDir}"`);
    await downloadFile(inDir, filePath.path.replace("s3://", ""));

    return parseFilePath(`${inDir}/${filePath.basename}`);
  }

  if (
    filePath.dir.startsWith("http://") ||
    filePath.dir.startsWith("https://")
  ) {
    return filePath;
  }

  throw new Error("Failed to resolve input path");
}
