---
next:
  text: "Getting Started"
  link: "/getting-started"
---

# Introduction

Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults.

Things get more complicated once you go beyond playing a basic <Badge type="info" text=".mp4" /> file. To offer different video qualities depending on the viewer's bandwidth, or to include multiple audio or text tracks, you need a different setup.

Before we go further, it's important to note that Mixwave intentionally keeps its scope limited. We choose to focus on a single playback protocol <Badge type="info" text="HLS CMAF" /> rather than trying to support a wide range of options.

## API

Essentially Mixwave is a set of APIs that handle video from ingest to playback. It is designed to be user-friendly, making video transcoding, packaging, and delivery accessible to a wider audience.

Typically, you transcode the video once. The resulting intermediary file is then assigned a generated UUID, which can be used to initiate a packaging job or to configure the stitcher for manipulating or merging playlists.

## Features

Mixwave makes it easier for you to do the following tasks using a user-friendly API:

### <img src="/transcode.svg" class="title-image" /> Transcode

The process of converting a video file from one format or codec to another. The [transcode](/features/transcode) job generates video, audio and text fragments from your sources and uploads them to `S3`. We ensure proper keyframes are in place for packaging purposes.

- Specify the various video streams, including their bitrates and resolutions.
- Define audio sources and their respective languages.

::: info
Consider the result of a transcode job as an intermediate format ready for packaging.
:::

<details>
<summary>Mock example</summary>

```
input   = content.mp4
streams = - video 1080p
          - video 720p
          - audio eng
output  = 67b070fd-5db6-4022-a568-652abdbfac9c
```

```
input   = bumper.mp4
streams = - video 1080p
          - video 720p
          - audio eng
output  = 13b1d432-ec8e-4516-9904-df1aa90db803
```

</details>

### <img src="/package.svg" class="title-image" /> Package

The process of preparing and organizing video files for delivery and playback over various streaming platforms and devices. Packaging isn't as resource intensive as transcoding. The [package](/features/package) job generates an HLS playlist from the output of a transcode job. Basically, it comes down to the following steps:

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

<details>
<summary>Mock example</summary>

```
input   = 67b070fd-5db6-4022-a568-652abdbfac9c
output  = https://my.cdn/package/67b070fd-5db6-4022-a568-652abdbfac9c/hls/master.m3u8
```

```
input   = 13b1d432-ec8e-4516-9904-df1aa90db803
output  = https://my.cdn/package/13b1d432-ec8e-4516-9904-df1aa90db803/hls/master.m3u8
```

</details>

### <img src="/stitch.svg" class="title-image" /> Stitch

At this point, you've created playable assets. Stitching involves serving the manifest through a proxy that can modify the output based on different parameters. If you're looking to dynamically merge manifests, stitch them together, or add interstitials, this is for you.

- Dynamically add [HLS Interstitials](https://developer.apple.com/videos/play/wwdc2022/10145/) to your main manifest.

::: warning
The stitch API is quite limited at the moment, but let us know what features you'd like by submitting a [feature ticket](https://github.com/matvp91/mixwave/issues).
:::

<details>
<summary>Mock example</summary>

```
input   = - assetId: 67b070fd-5db6-4022-a568-652abdbfac9c
          - bumperAssetId: 13b1d432-ec8e-4516-9904-df1aa90db803
output  = http://stitcher.mixwave/session/7b2a354a-69e3-4c16-accb-aa521c8b9d5b/master.m3u8
```

</details>

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
