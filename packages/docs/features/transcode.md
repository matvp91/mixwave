---
next:
  text: "Features: Package"
  link: "/features/package"
---

# Transcode

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

When we look at the [dashboard](/features/dashboard), when our job is finished, it'll respond with the following output data:

```json
{
  "assetId": "f7e89553-0d3b-4982-ba7b-3ce5499ac689"
}
```

At this point, our asset (a collection of streams) is ready for packaging, and can be referenced to by the given `assetId`.

::: info
Know that the result of a transcode job is merely an intermediary format. Typically, you'd transcode your input once and package as many times as you like for specific devices or use cases.
:::

Mixwave' transcode API works slightly different than what others do. We emphasize the idea to define what you have (input) and what you need (streams), and the system shall figure out how to craft the streams. There's no need to directly link a stream with a given output.
