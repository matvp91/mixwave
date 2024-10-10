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

### Alternative name

By default, the package job pushes the result to a folder named `hls`. You can use the `name` param to change the output folder. Think of it this way, we'd like to package a plain HLS playlist by default, but we want for the same transcode result a DRM (encrypted) playlist, which we then call `hls_drm`.

```json
{
  "assetId": "f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "name": "hls_drm"
}
```

Your asset is now available for playback at:

```
{S3_PUBLIC_URL}/package/f7e89553-0d3b-4982-ba7b-3ce5499ac689/hls_drm/master.m3u8
```
