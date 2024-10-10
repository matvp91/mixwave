import { dirSync } from "tmp";
import { downloadFile, uploadFile } from "../s3.js";
import parseFilePath from "parse-filepath";
import { FFmpeggy } from "ffmpeggy";
import ffmpegBin from "ffmpeg-static";
import type { Job } from "bullmq";
import type { Stream, Input } from "@mixwave/shared/schema";

if (!ffmpegBin) {
  throw new Error("Cannot find ffmpeg bin");
}

FFmpeggy.DefaultConfig = {
  ...FFmpeggy.DefaultConfig,
  ffmpegBin,
};

// The guys at shaka-streamer did a great job implementing an ffmpeg pipeline, we can always learn from it:
// https://github.com/shaka-project/shaka-streamer/blob/8bee20a09efab659ea3ecea8ff67db32202a807c/streamer/transcoder_node.py

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

export type FfmpegResult = {
  name: string;
  stream: Stream;
};

async function prepareInput(input: Input) {
  const filePath = parseFilePath(input.path);

  if (filePath.dir.startsWith("s3://")) {
    // If the input is on S3, download the file locally.
    const dir = dirSync();

    const s3SourcePath = filePath.path.replace("s3://", "");

    await downloadFile(dir.name, s3SourcePath);

    return parseFilePath(`${dir.name}/${filePath.basename}`);
  }

  return filePath;
}

export default async function (job: Job<FfmpegData, FfmpegResult>) {
  const { params } = job.data;

  const dir = dirSync();

  const inputFile = await prepareInput(params.input);

  job.log(`Input is ${inputFile.path}`);

  const ffmpeg = new FFmpeggy({
    input: inputFile.path,
    globalOptions: ["-loglevel error"],
  });

  let name: string | undefined;

  const outputOptions: string[] = [];

  if (params.stream.type === "video") {
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
    outputOptions.push(...getTextOutputOptions(params.stream));
  }

  if (!name) {
    throw new Error(
      "Missing name, this is most likely a bug. Report it, please.",
    );
  }

  ffmpeg.setOutput(`${dir.name}/${name}`);
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

  job.log(
    `Uploading ${dir.name}/${name} to transcode/${params.assetId}/${name}`,
  );

  await uploadFile(
    `transcode/${params.assetId}/${name}`,
    `${dir.name}/${name}`,
  );

  return {
    name,
    stream: params.stream,
  };
}

function getVideoOutputOptions(
  stream: Extract<Stream, { type: "video" }>,
  segmentSize: number,
) {
  const args: string[] = [
    "-f mp4",
    "-an",
    `-c:v ${stream.codec}`,
    `-b:v ${stream.bitrate}`,
    `-r ${stream.framerate}`,
    "-movflags +frag_keyframe",
    `-frag_duration ${segmentSize * 1_000_000}`,
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

  args.push(`-vf ${filters.join(",")}`);

  const keyFrameRate = segmentSize * stream.framerate;
  args.push(`-keyint_min ${keyFrameRate}`, `-g ${keyFrameRate}`);

  return args;
}

function getAudioOutputOptions(
  stream: Extract<Stream, { type: "audio" }>,
  segmentSize: number,
) {
  const args: string[] = [
    "-f mp4",
    "-vn",
    "-ac 2",
    `-c:a ${stream.codec}`,
    `-b:a ${stream.bitrate}`,
    `-frag_duration ${segmentSize * 1_000_000}`,
    `-metadata language=${stream.language}`,
    "-strict experimental",
  ];

  return args;
}

// We don't use stream as param, for now. But provide it for consistency.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTextOutputOptions(stream: Extract<Stream, { type: "text" }>) {
  const args: string[] = ["-f webvtt"];

  return args;
}
