# Learning

Here, we delve into the essential concepts and techniques behind transcoding, media pipelines, and all things related to video delivery. Let’s explore the fascinating world of video technology together!

The people at Mux did a great job creating a site about video engineering, read through [howvideo.works](https://howvideo.works/), they cover every aspect starting from transcode all the way to playback.

We'll quickly go over the terminology commonly found in the documentation to help you better understand it.

- **Transcoding**

  Convert video to different formats or quality levels for compatibility and optimization.

- **Packaging**

  Prepare video content for delivery by formatting it into segments and manifest files for streaming protocols (like HLS).

- **Stitching**

  Modifying playlist files to control video playback, such as switching streams or adding content dynamically (like ads, bumpers, ...).

- **Interstitials**

  Insert other content into an HLS stream by dynamically updating the playlist during video playback.

You might be wondering how these terms connect to the various packages in Superstreamer. Here’s an overview to clarify:

- **Artisan**

  Takes care of transcoding (ffmpeg) and packaging (shaka-packager).

- **Stitcher**

  Does all of the stitching, modifies playlists based on your needs, for each viewer individually if needed. When additional playlists (such as ads) need to be inserted, it'll insert the proper HLS interstitials tags.