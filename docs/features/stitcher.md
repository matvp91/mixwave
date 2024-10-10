---
next:
  text: "Frontend: Player"
  link: "/frontend/player"
---

# Stitcher

Stitcher is a playlist manipulator that can insert HLS interstitials on-the-fly. Several use cases include:

- Insert ads at given cue points.
- Add a bumper manifest at the start of a playlist, like Netflix' intro.
- Filter media playlists to fit your needs.

Providing input for the stitcher happens in the form of a `uri`. The support uri schemas are:

- `asset://{uuid}` - Aslong as you stay within the Mixwave ecosystem, each asset can be referenced with this schema. Stitcher will know what to do.
- `http(s)://example.com/video/master.m3u8` - Provide a master playlist from elsewhere.

## Create a session

Each playout to a viewer can be considered a session.

```sh [shell]
curl -X POST https://stitcher.domain.com/session
  -H "Content-Type: application/json"
  -d "{body}"
```

A minimal body payload may look like this:

```json
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  // or
  "uri": "https://example.com/video/master.m3u8"
}
```

Behind the scenes, stitcher will create a session and return you a personalised playlist url. Each session is identifiable by a randomly generated uuid. In the example below, we got back a new session with id `44220f14-ffdd-4cfa-a67f-62ef421b4460`. As all we did was create a session with an `uri`, the resulting master playlist will only cover that asset. Scroll further down if you'd like to extend the session with ads or a bumper.

Stitcher responds with the following:

```json
{
  "url": "https://stitcher.domain.com/session/44220f14-ffdd-4cfa-a67f-62ef421b4460/master.m3u8"
}
```

## Playlist manipulation

### Filters

Mixwave makes it a breeze to apply filters to both the `master` and the `media` playlists.

#### Limit resolution

When streaming over networks with limited bandwidth (e.g., mobile networks), removing higher-bitrate renditions can help prevent buffering issues or excessive data usage.

```json
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "filter": {
    "resolution": "> 480"
  }
}
```

### Interstitials

Let's say you transcoded and packaged a new asset with the id `abbda878-8e08-40f6-ac8b-3507f263450a`. The example below will add it as an interstitial. An HLS interstitials supported player will then switch to the new asset at position `10` and when finished, it'll go back to the main master playlist.

```json
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "interstitials": [
    {
      "timeOffset": 10,
      "uri": "asset://abbda878-8e08-40f6-ac8b-3507f263450a"
    }
  ]
}
```

<video class="video-frame" src="/video/InterstitialBumper.mp4" controls></video>

### VMAP

Instruct stitcher to add interstitials based on [VMAP](https://www.iab.com/guidelines/vmap/) definitions. Each VMAP contains one or more `AdBreak` elements with a position of where the interstitial should be.

```json
{
  "uri": "asset://f7e89553-0d3b-4982-ba7b-3ce5499ac689",
  "vmap": {
    "url": "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator="
  }
}
```

1. Stitcher will fetch the VMAP. Parses, resolves and flattens each corresponding VAST.
2. For each ad that has not yet been transcoded, it'll start a transcode and package job with sane defaults.
   - Each transcode or package job responsible for an ad is tagged with `ad` and can be observed in the dashboard.
3. For each ad that is available, it'll add an interstitial for playback.

::: warning
Ad impressions are not tracked yet, we'd eventually like to provide a client wrapper that tracks ads in a certified manner.
:::

<video class="video-frame" src="/video/AdInsertion.mp4" controls></video>
