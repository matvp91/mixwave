# Packages

Superstreamer is a monorepo, with multiple smaller projects inside.

## What's included

We'll provide a quick overview of them below to give you a sense of what each one does.

- **App**

  A Single Page Application (SPA) used to interact with the API or start a session on the Stitcher service.

- **API**

  The API serves as the primary interface for interacting with Superstreamer, such as start tasks like transcoding or packaging jobs.

  A swagger page is exposed on the `/swagger` endpoint.

- **Artisan**

  The actual job runners, these run in the background and consume whatever job API has scheduled next. Artisan instructs `ffmpeg` to run, or packages a previously transcoded asset to an HLS playlist and syncs it all to S3.

- **Stitcher**

  Also referred to as a "playlist manipulator," Stitcher can create a session for each user and generate a custom HLS playlist tailored to their needs, including resolution filtering and the addition of bumpers or linear ads. The stitcher has its own API.

  A swagger page is exposed on the `/swagger` endpoint.

::: tip
Artisan consumes jobs from a Redis queue. You can run as many Artisan instances as you like in the background, over multiple machines. This scales like a beast.
:::

## Practical example

We'll `POST` to the `/transcode` endpoint of the API with a payload that includes the following: the input files (eg; the BigBuckBunny.mp4 file) and a list of streams (the output, eg; we'd like to have a 480p and 720p video stream and an audio stream in English).

::: details A transcode payload example

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
  ],
  "streams": [
    {
      "type": "video",
      "codec": "hevc", // Look, a different codec, because we can.
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
      "language": "eng",
      "channels": 2
    },
  ]
}
```

:::

When an Artisan instance is active, it'll start working on the transcode job. When it finished running ffmpeg in the background, a couple of m4s / m4v files (audio, video streams) are pushed back to S3. You can see the active jobs and their status in the dashboard (App).

Superstreamer assigns a unique UUID, refered to as an _asset id_, to the job. At this point, we can speak of an asset.

::: tip

The dashboard (App) has a neat storage explorer. Search for the _asset id_ in the /transcode folder.

:::

Next, we'll package the fresh asset for online streaming. We'll `POST` to the `/package` endpoint of the API with our _asset id_.

::: details A package payload example

```json
{
  "assetId": "6775eb41-e62e-45ca-9525-9e14b71cf8f5"
}
```

:::

This'll produce an HLS playlist, located in `/package/6775eb41-e62e-45ca-9525-9e14b71cf8f5/hls/master.m3u8`. You can use the storage explorer to view the different files or take a sneak peak at the contents of the master playlist.

And tada 🎉, we now have a valid video streaming file on our S3 bucket!