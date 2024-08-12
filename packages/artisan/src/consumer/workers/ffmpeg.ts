import { dirSync } from "tmp";
import ffmpeg from "fluent-ffmpeg";
import { downloadFile, uploadFile } from "../s3.js";
import parseFilePath from "parse-filepath";
import type { Job } from "bullmq";
import type { Stream, Input } from "../../schemas.js";
import type { FfmpegCommand } from "fluent-ffmpeg";

export type FfmpegData = {
  parentSortKey?: number;
  input: Input;
  stream: Stream;
  segmentSize: number;
  assetId: string;
};

export type FfmpegResult = {
  name: string;
  stream: Stream;
};

export default async function (job: Job<FfmpegData, FfmpegResult>) {
  const { input, stream, segmentSize, assetId } = job.data;

  const dir = dirSync({
    name: assetId,
  });
  let inputFile = parseFilePath(input.path);

  if (inputFile.dir.startsWith("s3://")) {
    const s3SourcePath = inputFile.path.replace("s3://", "");

    job.log(`Source is on s3, downloading ${s3SourcePath} to ${dir.name}`);

    await downloadFile(dir.name, s3SourcePath);
    inputFile = parseFilePath(`${dir.name}/${inputFile.basename}`);
  }

  job.log(`Input is ${inputFile.path}`);

  let name: string | undefined;
  let ffmpegCmd: FfmpegCommand | undefined;

  if (stream.type === "video") {
    const keyFrameInterval = segmentSize * stream.framerate;

    let codec: string;
    switch (stream.codec) {
      case "h264":
        codec = "libx264";
        break;
      default:
        codec = stream.codec;
        break;
    }

    name = `video_${stream.height}_${stream.bitrate}_${stream.codec}.m4v`;

    ffmpegCmd = ffmpeg(inputFile.path)
      .noAudio()
      .format("mp4")
      .size(`?x${stream.height}`)
      .aspectRatio("16:9")
      .autoPad(true)
      .videoCodec(codec)
      .videoBitrate(stream.bitrate)
      .outputOptions([
        `-frag_duration ${segmentSize * 1e6}`,
        "-movflags +frag_keyframe",
        `-r ${stream.framerate}`,
        `-keyint_min ${keyFrameInterval}`,
        `-g ${keyFrameInterval}`,
      ])
      .output(`${dir.name}/${name}`);
  }

  if (stream.type === "audio") {
    name = `audio_${stream.language}_${stream.bitrate}.m4a`;

    ffmpegCmd = ffmpeg(inputFile.path)
      .noVideo()
      .format("mp4")
      .audioCodec(stream.codec)
      .audioBitrate(stream.bitrate)
      .outputOptions([
        `-metadata language=${stream.language}`,
        `-frag_duration ${segmentSize * 1e6}`,
      ])
      .output(`${dir.name}/${name}`);
  }

  if (stream.type === "text") {
    name = `text_${stream.language}.vtt`;

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

  job.log(`Uploading ${dir.name}/${name} to transcode/${assetId}/${name}`);

  await uploadFile(`transcode/${assetId}/${name}`, `${dir.name}/${name}`);

  return { name, stream };
}
