<p align="center">
 <img src="https://github.com/matvp91/mixwave/blob/main/assets/logo.png?raw=true" width="180" />
</p>

<p align="center">
  <a href="https://matvp91.github.io/mixwave/getting-started.html">Getting Started</a> · 
  <a href="https://matvp91.github.io/mixwave/examples/transcode.html">Transcode</a> · 
  <a href="https://matvp91.github.io/mixwave/examples/package">Package</a>
</p>

Mixwave is a self hostable platform that aims to simplify the complexities of video delivery. Transcode and package your media for online streaming with simple API calls and sane defaults.

Visit our [documentation](https://matvp91.github.io/mixwave/) for more info.

<p align="center">
 <kbd>
<img src="https://github.com/matvp91/mixwave/blob/main/assets/job.png?raw=true" width="940" />
 </kbd>
</p>

Wondering how easy it is? Let's pick a Big Buck Bunny video and package it to HLS with a single `720p` video track.

```javascript
{
  // Specify your input sources, can be video, audio or text.
  "inputs": [
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "video"
    },
    ...
  ],

  // Specify your output streams, you can add multiple video, audio or text streams with different options.
  "streams": [
    {
      "type": "video",
      "codec": "h264",
      "height": 720,
      "bitrate": 4000000,
      "framerate": 24
    },
    ...
  ],

  // When we finished the transcode job, we'll package right away.
  // In case you need fine grained control over packaging, you can call the package endpoint yourself.
  "package": true
}
```

When finished, an `HLS` playlist is available on your configured `S3` and is ready for playback.

> [!NOTE]
> **Mixwave is in early development, we would appreciate your feedback.**
