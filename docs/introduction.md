---
next:
  text: "Getting Started"
  link: "/getting-started"
---

# Introduction

Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults.

Things get more complicated once you go beyond playing a basic mp4 file. To offer different video qualities depending on the viewer's bandwidth, or to include multiple audio or text tracks, you need a different setup.

Before we go further, it's important to note that Mixwave intentionally keeps its scope limited. We choose to focus on a single playback protocol HLS CMAF rather than trying to support a wide range of options. We aim to avoid fragmentation by picking the right tools for the job. If you don't have to do the same thing multiple times, aiming for perfection is a lot easier.

## API

Essentially Mixwave is a set of APIs that handle video from ingest to playback. It is designed to be user-friendly, making video transcoding, packaging, and delivery accessible to a wider audience.

Typically, you transcode the video once. The resulting intermediary file is then assigned a generated UUID, which can be used to initiate a packaging job or to configure the stitcher for manipulating or merging playlists.

## Features

Mixwave makes it easier for you to do the following tasks using a user-friendly API:

### <img src="/transcode.svg" class="title-image" /> Transcode

The process of converting a video file from one format or codec to another. The [transcode](/features/transcode) job generates video, audio and text fragments from your sources and uploads them to `S3`.

- Specify the various video streams, including their bitrates and resolutions.
- Define audio sources and their respective languages.
- Respects segment size by inserting keyframes at the right place for packaging purposes later on.

::: info
Consider the result of a transcode job as an intermediate format ready for packaging.
:::

### <img src="/package.svg" class="title-image" /> Package

The process of preparing and organizing video files for delivery and playback over various streaming platforms and devices. Packaging isn't as resource intensive as transcoding. The [package](/features/package) job generates an HLS playlist from the output of a transcode job. Basically, it comes down to the following steps:

- Breaks the asset into smaller segments, players can then switch to lower or higher quality chunks depending on the viewer's available bandwidth.
- Generating playlist files that provide the player with information about how to access and assemble the video segments. Since we only support HLS, the playlist will be a m3u8 file.
- Adds necessairy metadata, like subtitle / audio language, DRM related info...
- Wraps the transcoded video data into a CMAF compliant container format.

::: warning
The packager API is quite limited at the moment, but we're actively working on making it more configurable.
:::

As with transcode, the end result will be uploaded to your configured `S3` bucket as well.

::: info
At this point, your stream can be played by HLS-compatible players, such as [HLS.js](https://github.com/video-dev/hls.js), or natively on Apple devices.
:::

### <img src="/stitcher.svg" class="title-image" /> Stitch

At this point, you've created playable assets. Stitching involves serving the playlist through a proxy that can modify the output based on different parameters. If you're looking to dynamically merge playlists, stitch them together, or add interstitials, this is for you.

- Dynamically add [HLS Interstitials](https://developer.apple.com/videos/play/wwdc2022/10145/) to your main playlist.
- Filter resolutions.
- Use a [VMAP](https://www.iab.com/guidelines/vmap/) to extract linear ads and insert them in the playlist.
