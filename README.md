<p align="center">
 <img src="https://github.com/matvp91/mixwave/blob/main/assets/logo.png?raw=true" width="180" />
</p>

<p align="center">
  <a href="https://matvp91.github.io/mixwave/getting-started.html">Getting Started</a> · 
  <a href="https://matvp91.github.io/mixwave/examples/transcode.html">Transcode</a> · 
  <a href="https://matvp91.github.io/mixwave/examples/package">Package</a>
</p>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/github/license/matvp91/mixwave">
  </a>
  <a href="#">
    <img src="https://img.shields.io/github/last-commit/matvp91/mixwave">
  </a>
  <a href="#">
    <img src="https://img.shields.io/github/stars/matvp91/mixwave" alt="stars">
  </a>
</p>

Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults. Craft dynamic HLS playlists on the fly.

We intentionally keeps the scope limited. We choose to focus on a single playback protocol `HLS CMAF` rather than trying to support a wide range of options such as MPEG-DASH. End to end video is complex enough already. We'd rather pick a well defined stack and aim for perfection.

- Transcode your video file into separate quality tracks (eg; 1080p, 720p, 480p).
- Write `HLS CMAF` playlists directly to S3, ready to be played by [HLS.js](https://github.com/video-dev/hls.js).
- Scale `ffmpeg` jobs horizontally, at up to 80% cost reduction on [EC2 Spot Instances](https://aws.amazon.com/ec2/spot/).
- Dynamically stitch HLS playlists together<sup>experimental</sup>, like a Netflix bumper, with [HLS interstitials](https://developer.apple.com/streaming/GettingStartedWithHLSInterstitials.pdf).
- Parses a `vmap`, transcodes and packages the ad media files and inserts interstitials, on the fly.

Want to get started quickly?

```shell
cp config.env.example config.env
# Open config.env and change the variables.
docker compose up -d
```

> [!NOTE] > **Mixwave is in early development, we would appreciate your feedback.**
