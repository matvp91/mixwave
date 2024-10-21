# What is Superstreamer?

Superstreamer is here to make video delivery simple. Imagine having everything you need in one platform — starting with your raw video, Superstreamer helps you transcode it, package it into HLS playlists, and upload it to S3 with ease. You can even create custom playlists for each viewer, adding bumpers, ads, or filters on the fly.

When it’s time for your audience to watch, Superstreamer’s elegant web player ensures your videos are delivered smoothly and look great on any device. It takes the hassle out of streaming, so viewers can enjoy your content without any interruptions.

There are plenty of great video tools out there, but we saw a gap — a unified platform to bring all those tools together. Our mission with Superstreamer is to make video more accessible for developers, letting them focus on their projects without getting bogged down by the technical details.

::: info
Can't wait? Head over to our [Getting Started](/guide/getting-started) page and jump right into it!
:::

## Developer Experience

- **Simplified workflow**

  Handling video at scale involves multiple steps: ingesting source files, transcoding them into various formats, packaging for different devices, and ensuring smooth delivery. Superstreamer streamlines these steps into a unified workflow.

- **Scalability**

  Video platforms often need to serve content to large, diverse audiences, which requires infrastructure that can handle spikes in traffic and support multiple video formats. Superstreamer can be scaled horizontally due to a built-in queue / worker architecture and works great with any S3 compliant storage.

- **Customization and Personalization**

  Modern video platforms often need to deliver personalized content, such as inserting targeted ads, bumpers, or even dynamically altering playlists based on user behavior. Superstreamer is built for these needs and can handle the real-time processing required to customize video streams.

- **Cost Efficiency**

  Building and maintaining a full-scale video pipeline can be resource-intensive. Fortunately, Superstreamer isn’t tied to a single vendor, allowing you the freedom to choose the most effective and cost-efficient strategies for your media setup.

## Core Standards

We believe in sticking to the tried-and-true standards that make video delivery easier for everyone. By using common formats like H.264, HEVC, AAC, EC-3, ... and streaming methods like HLS, we make sure our platform works smoothly across all devices. When it comes to ads, we stick to IAB VAST for placements, which helps us connect easily with different advertising networks.

Video is already a pretty fragmented space. By sticking to our standards, we aim to cut through that confusion and make things more straightforward. When you don’t have to tackle everything at once, it’s much easier to strive for perfection. That’s why we made these thoughtful choices:

- HLS as a playlist format, with CMAF containered segments.
- Inserting and playing other playlists, like ads, depends completely on [HLS interstitials](https://developer.apple.com/streaming/GettingStartedWithHLSInterstitials.pdf).
- No VAST on the client, ever. 😜
- Don’t reinvent the wheel — leverage the fantastic work of others. If that means making open-source contributions, we’re all for it.