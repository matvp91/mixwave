---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Superstreamer
  text: Effortless video
  tagline: All-in-one toolkit from ingest to adaptive video playback.
  actions:
    - theme: brand
      text: Introduction
      link: /guide/what-is-superstreamer
    - theme: alt
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/matvp91/superstreamer
  image:
    src: /logo-mascotte.png
    alt: VitePress

features:
  - title: Transcode
    details: Converting a video file from one format or codec to another, at scale.
  - title: Package
    details: Prepare and organize video files for delivery and playback. Upload directly to S3.
  - title: Stitcher
    details: Manipulate and craft HLS playlists on the fly, supports HLS interstitials.
  - title: Player
    details: A unified <a href="https://github.com/video-dev/hls.js">HLS.js</a> API and React components that integrate seamlessly.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #ff4d00 30%, #ff9a00);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, rgba(255, 77, 0, .2) 40%, rgba(255, 154, 0, .2) 40%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}

.VPHomeHero .VPImage {
  max-width: 160px;
}
</style>