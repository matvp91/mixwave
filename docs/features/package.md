---
next:
  text: "Features: Stitcher"
  link: "/features/stitcher"
---

# Package

Video packaging refers to the process of preparing a video file for delivery and consumption by users across different devices and platforms.

- The video is split into smaller segments or chunks, usually a few seconds long, to facilitate adaptive bitrate streaming (ABR), which adjusts quality based on network conditions.

- A manifest file (m3u8 for HLS) is generated. It contains metadata about the available segments, bitrates, and resolutions, helping the player know what content to request based on the user’s network conditions.

## API

The package job will prepare an HLS playlist for your asset. Before you package, check the [transcode](/features/transcode) instructions.

::: code-group

```sh [shell]
curl -X POST https://api.domain.com/package
  -H "Content-Type: application/json"
  -d "{body}"
```

:::

A minimal body payload may look like this:

```json
{
  "assetId": "f7e89553-0d3b-4982-ba7b-3ce5499ac689"
}
```

Your asset is now available for playback at:

```
{S3_PUBLIC_URL}/package/f7e89553-0d3b-4982-ba7b-3ce5499ac689/hls/master.m3u8
```

::: tip
Each package result is uploaded to /package/{assetId}/hls/master.m3u8
:::

## Example

We started by [transcoding](/features/transcode#example) two input files (content.mp4 and bumper.mp4) to multiple streams. We'll now package these their HLS master and media playlists files.

```
input   = 67b070fd-5db6-4022-a568-652abdbfac9c
output  = https://my.cdn/package/67b070fd-5db6-4022-a568-652abdbfac9c/hls/master.m3u8
```

```
input   = 13b1d432-ec8e-4516-9904-df1aa90db803
output  = https://my.cdn/package/13b1d432-ec8e-4516-9904-df1aa90db803/hls/master.m3u8
```
