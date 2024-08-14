---
next:
  text: "Getting Started"
  link: "/getting-started"
---

# What is Mixwave?

Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults.

Things get more complicated once you go beyond playing a basic <Badge type="info" text=".mp4" /> file. To offer different video qualities depending on the viewer's bandwidth, or to include multiple audio or text tracks, you need a different setup.

Before we go further, it's important to note that Mixwave intentionally keeps its scope limited. We choose to focus on a single playback protocol <Badge type="info" text="HLS CMAF" /> rather than trying to support a wide range of options.

## Features

Mixwave makes it easier for you to do the following tasks using a user-friendly API:

### 1. Transcode

The process of converting a video file from one format or codec to another. The <Badge type="info" text="transcode" /> job generates video, audio and text fragments from your sources and uploads them to `S3`. We ensure proper keyframes are in place for packaging purposes.

- Specify the various video streams, including their bitrates and resolutions.
- Define audio sources and their respective languages.

::: info
Consider the result of a transcode job as an intermediate format ready for packaging.
:::

### 2. Package

The process of preparing and organizing video files for delivery and playback over various streaming platforms and devices. Packaging isn't as resource intensive as transcoding. Basically, it comes down to the following steps:

- Breaks the asset into smaller segments, players can then switch to lower or higher quality chunks depending on the viewer's available bandwidth.
- Generating playlist files that provide the player with information about how to access and assemble the video segments. Since we only support HLS, the manifest will be a <Badge type="info" text=".m3u8" /> file.
- Adds necessairy metadata, like subtitle / audio language, DRM related info...
- Wraps the transcoded video data into a `CMAF` compliant container format.

::: warning
The packager API is quite limited at the moment, but we're actively working on making it more configurable.
:::

As with transcode, the end result will be uploaded to your configured `S3` bucket as well.

::: info
At this point, your stream can be played by HLS-compatible players, such as [HLS.js](https://github.com/video-dev/hls.js), or natively on Apple devices.
:::

### 3. Stitch

At this point, you've created playable assets. Stitching involves serving the manifest through a proxy that can modify the output based on different parameters. If you're looking to dynamically merge manifests, stitch them together, or add interstitials, this is for you.

- Dynamically add [HLS Interstitials](https://developer.apple.com/videos/play/wwdc2022/10145/) to your main manifest.

::: warning
The stitch API is quite limited at the moment, but let us know what features you'd like by submitting a [feature ticket](https://github.com/matvp91/mixwave/issues).
:::

## Structure

Mixwave consists of the following packages:

<table>
  <tr>
    <th>Package</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><a href="https://github.com/matvp91/mixwave/tree/main/packages/api" target="_blank"><b>api</b></a></td>
    <td>Used to interact with the system. Start transcode jobs, get a list of pending jobs, and much more.</td>
  </tr>
  <tr>
    <td><a href="https://github.com/matvp91/mixwave/tree/main/packages/artisan" target="_blank"><b>artisan</b></a></td>
    <td>The main job runner, can be run on as many machines as you like.</td>
  </tr>
  <tr>
    <td><a href="https://github.com/matvp91/mixwave/tree/main/packages/stitcher" target="_blank"><b>stitcher</b></a></td>
    <td>A manifest (HLS playlist) proxy for on the fly manipulation, such as interstitials insertion.</td>
  </tr>
  <tr>
    <td><a href="https://github.com/matvp91/mixwave/tree/main/packages/dashboard" target="_blank"><b>dashboard</b></a></td>
    <td>A front-end that uses the api and visualizes running jobs.</td>
  </tr>
</table>
