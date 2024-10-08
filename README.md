<div align="center">
  <img src="./public/logo-full.png" width="420" />

  <h3>Mixwave</h3>
  <h4>From video processing to playback in a matter of minutes</h4>
  
  <p align="center">
    <img src="https://img.shields.io/github/license/matvp91/mixwave">
    <img src="https://img.shields.io/github/last-commit/matvp91/mixwave">
    <img src="https://img.shields.io/github/stars/matvp91/mixwave" alt="stars">
    <img src="https://img.shields.io/badge/PR's-welcome-0437F2" alt="pr">
    <a href="https://discord.gg/4hXgz9EsF4">
      <img src="https://img.shields.io/discord/1290252589522223166?v=1" alt="discord">
    </a>
  </p>

  <p align="center">
    <a href="https://matvp91.github.io/mixwave">Documentation</a> · 
    <a href="https://matvp91.github.io/mixwave/getting-started.html">Getting Started</a>
  </p>

  [<img src="./public/button-buy-me-a-coffee.png" width="150" alt="Buy me a coffee button"/>](https://www.buymeacoffee.com/matvp91)
</div>

Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults, or craft dynamic HLS playlists on the fly with bumpers, ads and filters.

- Transcode your video file into separate quality tracks (eg; 1080p, 720p, 480p).
- Write `HLS CMAF` playlists directly to S3, ready to be played by [HLS.js](https://github.com/video-dev/hls.js).
- Scales `ffmpeg` jobs horizontally.
- Manually insert [HLS interstitials](https://developer.apple.com/streaming/GettingStartedWithHLSInterstitials.pdf), like the Netflix bumper.
- Parses an [Ad Playlist](https://www.iab.com/guidelines/vmap/) (VMAP), transcodes and packages the ad media files and inserts them as interstitials, on the fly.
- Player included, with a UI written in React.

We're on [Discord](https://discord.gg/4hXgz9EsF4) if you'd like to chat or need support.

## Motivation

Video is quite fragmented, particularly in the way video content is delivered and protected across different platforms and devices. Think [MPEG-DASH vs. HLS](https://www.gumlet.com/learn/hls-vs-dash/), CTR vs. CBCS, [SSAI vs. CSAI](https://clearcode.cc/blog/client-side-server-side-ad-insertion/). Besides, there's also a lot of cool things happening behind closed doors, like SGAI with [AWS EMT](https://docs.aws.amazon.com/mediatailor/latest/ug/server-guided.html) or [Disney+](https://medium.com/disney-streaming/using-sgai-to-deliver-and-play-ads-with-flexibility-and-scale-b5c18aeb7bca). We aim to avoid fragmentation by picking the right tools for the job. If you don't have to do the same thing multiple times, aiming for perfection is a lot easier. We believe `HLS CMAF` is the right way forward, and when playlist manipulation is required, we tend to lean towards `HLS Interstitials`. There's obviously going to be roadblocks ahead, think of devices not supporting multiple video elements or partially serving encrypted fragments opposed to plain ads. We'll tackle these once we get there.

There's a lot of video tooling out there, think of ffmpeg, bento4, shaka-packager, but not in a unified manner. Mixwave implements the excellent work done by others, and tries to make it approachable in the form of an API with a strong focus on scalability and ease of use. The latter is quiet challenging, you'd only have to look at how complex ffmpeg gets when you get into the details.

Video from source to consumer is a hard task to get right, [howvideo.works](https://howvideo.works/) is a great resource to get you started.

## Getting Started

```shell
# Clone repository locally.
git clone git@github.com:matvp91/mixwave.git
cd mixwave

cp config.env.example config.env
# Open config.env and change the variables.
docker compose up -d
```

There's more info in the [Getting Started](https://matvp91.github.io/mixwave/getting-started.html) section in the docs.

## Player

We built a `facade` that simplifies working with [HLS.js](https://github.com/video-dev/hls.js) and React player components. 

* **Demo**: We created a sample on [StackBlitz - Mixwave Player Demo](https://stackblitz.com/edit/mixwave-player-demo) if you're interested in the implementation details.
* **Documentation**: There's a separate [README](https://github.com/matvp91/mixwave/tree/main/packages/player) dedicated to the player module.

```sh
# make sure hls.js is atleast v1.6.0, with interstitials support.
npm i hls.js
npm i @mixwave/player
```

https://github.com/user-attachments/assets/b839a0dd-4c5f-443a-b53e-f21742be0875

## Demos

### Transcode & Package

Let's take the popular BigBuckBunny MP4 video and package it in two different resolutions: 480p and 720p. Once that's done, we'll use the `packageAfter` flag to immediately package the files. In the end, we'll have an HLS playlist ready and stored on our S3.

https://github.com/user-attachments/assets/5fb52e94-c729-4d5b-8f27-a93c161d07e2

### Prepend a bumper dynamically

You know what's even more exciting than just playing videos? Manipulating them in real-time! We'll quickly transcode and package the iconic Netflix bumper, then prepend it to the beginning of our BigBuckBunny video.

https://github.com/user-attachments/assets/b799d7d4-9f53-40ae-bd9b-51589d31fef3

### Insert linear ads

To wrap things up, we'll have the stitcher fetch a few Google IMA video ads and insert them into our playlist. If you need more control, feel free to customize the ad request however you'd like, as long as the final output is a [VMAP](https://www.iab.com/guidelines/vmap/). Each ad break defined in the VMAP will then be mapped to interstitials.

https://github.com/user-attachments/assets/10fa274d-1761-4d10-9c39-065f241f84aa

## 🤝 Contribute

New contributors are welcome! See `CONTRIBUTING.md` for contributing to the project.
