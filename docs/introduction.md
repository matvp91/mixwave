---
next:
  text: "Getting Started"
  link: "/getting-started"
---

# Introduction

Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults.

Video delivery is quite fragmented, especially when it comes to how content is streamed and protected on different platforms and devices. For example, delivering video in an HLS playlist is a whole different beast compared to MPEG-DASH. While there used to be solid reasons for this, like device compatibility, we now believe this kind of fragmentation isn’t necessary anymore — especially with CMAF becoming the standard. So, we’re keeping things simple and focusing on just one playback protocol: HLS with CMAF. Instead of trying to support everything under the sun, we’re sticking with the best tool for the job. When you don’t have to do the same thing over and over, aiming for perfection gets way easier.

Delivering video gets more complex once you move beyond just providing a simple MP4 file to your users. If you want to offer different video qualities based on the viewer's bandwidth, or include multiple audio and text tracks, you need a more advanced setup. That's where Mixwave comes in.

## Terminology

You’ll come across a lot of specific video terms in our documentation. We want to go over these first to make sure we're all on the same page. We’ll keep things straightforward, but if you’re curious to dive deeper into video, there's plenty of info at https://howvideo.works/.

- Transcoding - Convert video to different formats or quality levels for compatibility and optimization.
- Packaging - Prepare video content for delivery by formatting it into segments and manifest files for streaming protocols (like HLS).
- Stitching - Modifying playlist files to control video playback, such as switching streams or adding content dynamically (like ads, bumpers, ...).
- Interstitials - Insert other content into an HLS stream by dynamically updating the playlist during video playback.
- Codec - A video or audio codec compresses and decompresses media files to reduce their size for storage or streaming.

## Features

Mixwave makes it easier for you to do the following tasks using a user-friendly API and our dashboard:

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
