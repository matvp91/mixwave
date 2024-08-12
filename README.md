# <img src="https://github.com/matvp91/mixwave/blob/main/assets/logo.png?raw=true" width="140" />

Mixwave is a comprehensive toolset designed to streamline your video workflow, covering everything from transcoding and packaging to playback. With its user-friendly API, Mixwave makes self-hosting videos easy.

The video world is full of variety, with numerous codecs and various playout protocols like MPEG-DASH and HLS. We believe that video doesn't have to be so fragmented, so we focus primarily on the following key areas:

- **HLS CMAF**: By exclusively supporting HLS CMAF, we can fine-tune our solutions to achieve perfection.
- **Batch transcoding**: Our queue architecture simplifies horizontal scaling by enabling multiple transcoding jobs to run simultaneously across different machines.
- **Adaptive streaming**: Multiple video / audio tracks, ensuring smooth playback on any device or network condition.
- **Playback**: [HLS.js](https://github.com/video-dev/hls.js) compatible, aslong as [MSE](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API) and [EME](https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API) are available, you're good to go.

Mixwave consists of the following packages:

- **API**: Designed to simplify the complex task of transcoding and packaging video files.
- **Dashboard**: A frontend application that provides insights of running jobs and offers a user-friendly interface to the API for testing purposes.
- **Artisan**: A queue-architectured job runner designed for a variety of tasks, such as FFmpeg processing and packaging.
- **Stitcher**: A manifest manipulation proxy that enables the creation of personalized manifests, heavily focused on `HLS Interstitials`.
