Run redis with `redis-stack-server`, `@redis/json` is required.

```json
{
  "inputs": [
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "video"
    },
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "audio",
      "language": "eng"
    },
    {
      "path": "s3://source/test_en.vtt",
      "type": "text",
      "language": "eng"
    },
    {
      "path": "s3://source/test_nl.vtt",
      "type": "text",
      "language": "nld"
    }
  ],
  "streams": [
    {
      "type": "video",
      "codec": "h264",
      "height": 720,
      "bitrate": 4000000,
      "framerate": 24
    },
    {
      "type": "video",
      "codec": "h264",
      "height": 480,
      "bitrate": 1500000,
      "framerate": 24
    },
    {
      "type": "audio",
      "codec": "aac",
      "bitrate": 128000,
      "language": "eng"
    },
    {
      "type": "text",
      "language": "eng"
    },
    {
      "type": "text",
      "language": "nld"
    }
  ],
  "segmentSize": 4
}
```

For next: 3f6c2ac6-c21d-4878-b7bf-8900331239b8

```json
{
  "interstitials": [
    {
      "offset": 0,
      "assetId": "9d48963f-d55b-4052-b80a-40d7056a0dd0"
    }
  ]
}
```

```json
{
  "inputs": [
    {
      "path": "s3://source/BigBuckBunny.mp4",
      "type": "video"
    }
  ],
  "streams": [
    {
      "type": "video",
      "codec": "h264",
      "height": 480,
      "bitrate": 1500000,
      "framerate": 24
    }
  ],
  "segmentSize": 4
}
```
