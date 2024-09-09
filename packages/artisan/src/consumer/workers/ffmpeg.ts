import { dirSync } from "tmp";
import ffmpeg from "fluent-ffmpeg";
import { downloadFile, uploadFile } from "../s3.js";
import parseFilePath from "parse-filepath";
import ffmpegBin from "@ffmpeg-installer/ffmpeg";
import type { Job } from "bullmq";
import type { Stream, Input } from "../../schemas.js";
import type { FfmpegCommand } from "fluent-ffmpeg";

console.log(`Set ffmpeg path to "${ffmpegBin.path}"`);

ffmpeg.setFfmpegPath(ffmpegBin.path);

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

export default async function (job: Job<FfmpegData, FfmpegResult>) {
  const { params } = job.data;

  const dir = dirSync();
  let inputFile = parseFilePath(params.input.path);

  if (inputFile.dir.startsWith("s3://")) {
    const s3SourcePath = inputFile.path.replace("s3://", "");

    job.log(`Source is on s3, downloading ${s3SourcePath} to ${dir.name}`);

    await downloadFile(dir.name, s3SourcePath);
    inputFile = parseFilePath(`${dir.name}/${inputFile.basename}`);
  }

  job.log(`Input is ${inputFile.path}`);

  let name: string | undefined;
  let ffmpegCmd: FfmpegCommand | undefined;

  if (params.stream.type === "video") {
    const keyFrameInterval = params.segmentSize * params.stream.framerate;

    let codec: string;
    switch (params.stream.codec) {
      case "h264":
        codec = "libx264";
        break;
      default:
        codec = params.stream.codec;
        break;
    }

    name = `video_${params.stream.height}_${params.stream.bitrate}_${params.stream.codec}.m4v`;

    ffmpegCmd = ffmpeg(inputFile.path)
      .noAudio()
      .format("mp4")
      .size(`?x${params.stream.height}`)
      .aspectRatio("16:9")
      .autoPad(true)
      .videoCodec(codec)
      .videoBitrate(params.stream.bitrate)
      .outputOptions([
        `-frag_duration ${params.segmentSize * 1e6}`,
        "-movflags +frag_keyframe",
        `-r ${params.stream.framerate}`,
        `-keyint_min ${keyFrameInterval}`,
        `-g ${keyFrameInterval}`,
      ])
      .output(`${dir.name}/${name}`);
  }

  if (params.stream.type === "audio") {
    name = `audio_${params.stream.language}_${params.stream.bitrate}.m4a`;

    ffmpegCmd = ffmpeg(inputFile.path)
      .noVideo()
      .format("mp4")
      .audioCodec(params.stream.codec)
      .audioBitrate(params.stream.bitrate)
      .outputOptions([
        `-metadata language=${params.stream.language}`,
        `-frag_duration ${params.segmentSize * 1e6}`,
      ])
      .output(`${dir.name}/${name}`);
  }

  if (params.stream.type === "text") {
    name = `text_${params.stream.language}.vtt`;

    ffmpegCmd = ffmpeg(inputFile.path).output(`${dir.name}/${name}`);
  }

  if (!ffmpegCmd || !name) {
    throw new Error("No ffmpeg cmd or file created.");
  }

  job.log(`Transcode to ${name}`);

  await new Promise((resolve, reject) => {
    ffmpegCmd
      .on("error", reject)
      .on("end", () => {
        job.updateProgress(100);
        job.log("Finished transcode");
        resolve(undefined);
      })
      .on("start", (cmdLine) => {
        job.log(cmdLine);
      })
      .on("progress", (event) => {
        job.updateProgress(event.percent ?? 0);
      })
      .run();
  });

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
