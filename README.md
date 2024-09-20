<div align="center">
  <img src="https://matvp91.github.io/mixwave/preview-logo.png" width="420" />

  <p align="center">
    <img src="https://img.shields.io/github/license/matvp91/mixwave">
    <img src="https://img.shields.io/github/last-commit/matvp91/mixwave">
    <img src="https://img.shields.io/github/stars/matvp91/mixwave" alt="stars">
    <img src="https://img.shields.io/badge/PR's-welcome-0437F2" alt="pr">
  </p>

  <p align="center">
    <a href="https://matvp91.github.io/mixwave">Documentation</a> · 
    <a href="https://matvp91.github.io/mixwave/getting-started.html">Getting Started</a>
  </p>

  [<img src="./public/button-buy-me-a-coffee.png" width="150" alt="Buy me a coffee button"/>](https://www.buymeacoffee.com/matvp91)
</div>


Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults. Craft dynamic HLS playlists on the fly.

We intentionally keep the scope limited. We choose to focus on a single playback protocol `HLS CMAF` rather than trying to support a wide range of options such as MPEG-DASH. End to end video is complex enough already. We'd rather pick a well defined stack and aim for perfection.

- Transcode your video file into separate quality tracks (eg; 1080p, 720p, 480p).
- Write `HLS CMAF` playlists directly to S3, ready to be played by [HLS.js](https://github.com/video-dev/hls.js).
- Scale `ffmpeg` jobs horizontally, at up to 80% cost reduction on [EC2 Spot Instances](https://aws.amazon.com/ec2/spot/).
- Dynamically stitch HLS playlists together<sup>experimental</sup>, like a Netflix bumper, with [HLS interstitials](https://developer.apple.com/streaming/GettingStartedWithHLSInterstitials.pdf).
- Parses a `vmap`, transcodes and packages the ad media files and inserts interstitials, on the fly.

Mixwave has a basic video player built on top of HLS.js. Although know that HLS interstitials support is a [pending feature](https://github.com/video-dev/hls.js/issues/5730), we included a build for you to work with and a wrapper with basic state management.

## Getting Started

```shell
cp config.env.example config.env
# Open config.env and change the variables.
docker compose up -d
```

There's more info in the [Getting Started](https://matvp91.github.io/mixwave/getting-started.html) section in the docs.

## 🤝 Contribute

New contributors are welcome! See `CONTRIBUTING.md` for contributing to the project.
