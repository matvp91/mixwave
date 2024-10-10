---
next:
  text: "Features: Package"
  link: "/features/package"
---

# Transcode

Video transcoding is the process of converting video from one format to another. This involves changing the file's encoding to make it compatible with different devices, reduce its size, or adjust its quality. Why is it important, you may ask?

- Different devices and internet connections handle video data differently. High-quality video can consume a lot of bandwidth, which might not be available to all users, especially those with slower internet speeds. By transcoding videos into lower-resolution formats, the video becomes more accessible without consuming too much bandwidth.

- Platforms like YouTube and Netflix use adaptive streaming to deliver videos. They transcode videos into multiple resolutions (e.g., 1080p, 720p, 480p). When you watch a video, the platform automatically adjusts the video quality based on your internet speed. If your connection is fast, you get high-quality video; if it's slow, you get a lower-quality version to prevent buffering.

This dynamic delivery ensures smooth playback across various network conditions and devices, making the video experience better for everyone.

<video class="video-frame" src="/video/TranscodeAndPackage.mp4" controls></video>

## Dashboard

You can use the dashboard to either view pending, processing, finished or failed transcode jobs, or you can use it to interact with the API. In the video below, we'll demonstrate how to transcode an mp4 file to a variety of streams.

## API

The transcode endpoint will push a job to the queue. The trancode job will create a separate ffmpeg job for each output stream defined in the body.

::: code-group

```sh [shell]
curl -X POST https://api.domain.com/transcode
  -H "Content-Type: application/json"
  -d "{body}"
```

:::

A minimal body payload may look like this:

```json
{
  "inputs": [
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "video"
    },
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "audio",
      "language": "eng"
    },
    {
      "path": "s3://source/BigBuckBunnyEng.vtt",
      "type": "text",
      "language": "eng"
    }
  ],
  "streams": [
    {
      "type": "video",
      "codec": "h264",
      "height": 720,
      "bitrate": 4000000,
      "framerate": 24
    },
    {
      "type": "video",
      "codec": "h264",
      "height": 480,
      "bitrate": 1500000,
      "framerate": 24
    },
    {
      "type": "audio",
      "codec": "aac",
      "bitrate": 128000,
      "language": "eng"
    },
    {
      "type": "text",
      "language": "eng"
    }
  ]
}
```

First, we'll specify the input files. In our example, we have a video file that contains audio aswell, named `BigBuckBunny.mp4`. We also have a text file containing subtitles called `BigBuckBunnyEng.vtt`. All of the files are available on our `S3` bucket.

::: tip
You can use http or s3 as schema to specify a source. When http, Mixwave will download the file locally for you from the URL.
:::

The job will produce several streams and upload them to `S3`:

- A video track (h264, avc) of 720 in height, with a bitrate of 4,000 kbps.
- A video track (h264, avc) of 480 in height, with a bitrate of 1,500 kbps.
- A audio track (aac) with a language of "English" and a bitrate of 128 kbps.

When we look at the [dashboard](/frontend/dashboard), when our job is finished, it'll respond with the following output data:

```json
{
  "assetId": "f7e89553-0d3b-4982-ba7b-3ce5499ac689"
}
```

At this point, our asset (a collection of streams) is ready for packaging, and can be referenced to by the given `assetId`.

::: info
Know that the result of a transcode job is merely an intermediary format. Typically, you'd transcode your input once and package as many times as you like for specific devices or use cases.
:::

Mixwave' transcode API works slightly different than what others do. We emphasize the idea to define what you have (input) and what you need (streams), and the system shall figure out how to craft the streams. There's no need to directly link an input with a given output.
