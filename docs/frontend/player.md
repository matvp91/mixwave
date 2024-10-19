---
next:
  text: "Frontend: Dashboard"
  link: "/frontend/dashboard"
outline: 2
---

# Player

We built a couple of tools to simplify working with HLS streams through [HLS.js](https://github.com/video-dev/hls.js) and HLS Interstitials. HLS.js is primarily a streaming library and can get tricky once you dive into the details. We tried to abstract away these details by providing a simple `HlsFacade` wrapper. Since you provide an `Hls` instance yourself, you're still in full control to do as you please. Our goal is not to abstract away the neat HLS.js API, but rather build an extension that simplifies certain things like quality selection, reading interstitial state, events, ...

> [!CAUTION]
> Today we rely on a beta build of HLS.js, v1.6.0-beta.1, once a final version is out, we'll update the peer dependency.

<video class="video-frame" src="/video/Player.mp4" loop muted autoplay></video>

## Installation

```sh
npm i hls.js@1.6.0-beta.1
npm i @mixwave/player
```

## Facade

```typescript
import Hls from "hls.js";
import { HlsFacade } from "@mixwave/player";

const hls = new Hls();

const mediaElement = document.querySelector("video");
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls, mediaElement);

hls.loadSource("https://domain.com/master.m3u8");

// You can now interact with facade,
// call facade.playOrPause(), get facade.state, ...
```

## UI

### Tailwind

The components are styled with [Tailwind](https://tailwindcss.com/), make sure you have it setup properly. Open your `tailwind.config.js` file and include the player build.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@mixwave/player/dist/**/*.{js,ts,jsx,tsx}",
  ],
  // The rest of the config...
};
```

### React component

We primarily built the UI on top of methods and state managed by the `facade`. State exposed by the facade holds all necessary info to get you started on building your own UI, and the methods are designed in a way that it makes sense for a UI to bind directly to them (eg; `facade.playOrPause()`).

```tsx
import Hls from "hls.js";
import {
  ControllerProvider,
  Controls,
  useController,
} from "@mixwave/player/react";

export function PlayerControls() {
  const [hls] = useState(() => new Hls());
  const controller = useController(hls);

  useEffect(() => {
    if (url) {
      hls.loadSource(url);
    }
  }, [url]);

  return (
    <ControllerProvider controller={controller}>
      <div
        className="relative aspect-video bg-black overflow-hidden rounded-md"
        data-mix-container
      >
        <video
          ref={controller.mediaRef}
          className="absolute inset-O w-full h-full"
        />
        <Controls />
      </div>
    </ControllerProvider>
  );
}
```

## Example

If you want to see a running example, check [StackBlitz - Mixwave Player Demo](https://stackblitz.com/edit/mixwave-player-demo).

## Enumerations

### Events

List of events.

#### Enumeration Members

| Enumeration Member       | Value                    |
| ------------------------ | ------------------------ |
| `AUDIO_TRACKS_CHANGE`    | `"audioTracksChange"`    |
| `AUTO_QUALITY_CHANGE`    | `"autoQualityChange"`    |
| `PLAYHEAD_CHANGE`        | `"playheadChange"`       |
| `QUALITIES_CHANGE`       | `"qualitiesChange"`      |
| `READY`                  | `"ready"`                |
| `RESET`                  | `"reset"`                |
| `SUBTITLE_TRACKS_CHANGE` | `"subtitleTracksChange"` |
| `TIME_CHANGE`            | `"timeChange"`           |
| `VOLUME_CHANGE`          | `"volumeChange"`         |

## Classes

### HlsFacade

A facade wrapper that simplifies working with HLS.js API.

#### Constructors

##### new HlsFacade()

```ts
new HlsFacade(hls, userOptions?): HlsFacade
```

###### Parameters

| Parameter      | Type                                                                 |
| -------------- | -------------------------------------------------------------------- |
| `hls`          | `Hls`                                                                |
| `userOptions`? | `Partial`\<[`HlsFacadeOptions`](/frontend/player#hlsfacadeoptions)\> |

###### Returns

[`HlsFacade`](/frontend/player#hlsfacade)

#### Properties

| Property | Type  |
| -------- | ----- |
| `hls`    | `Hls` |

#### Accessors

##### audioTracks

```ts
get audioTracks(): AudioTrack[]
```

Audio tracks of the primary asset.

###### Returns

[`AudioTrack`](/frontend/player#audiotrack)[]

##### autoQuality

```ts
get autoQuality(): boolean
```

Whether auto quality is enabled for all assets.

###### Returns

`boolean`

##### cuePoints

```ts
get cuePoints(): number[]
```

A list of ad cue points, can be used to plot on a seekbar.

###### Returns

`number`[]

##### duration

```ts
get duration(): number
```

Duration of the primary asset.

###### Returns

`number`

##### interstitial

```ts
get interstitial(): null | Interstitial
```

When currently playing an interstitial, this holds all the info
from that interstitial, such as time / duration, ...

###### Returns

`null` \| [`Interstitial`](/frontend/player#interstitial-1)

##### playhead

```ts
get playhead(): Playhead
```

Returns the playhead, will preserve the user intent across interstitials.
When we're switching to an interstitial, and the user explicitly requested play,
we'll still return the state as playing.

###### Returns

[`Playhead`](/frontend/player#playhead-1)

##### qualities

```ts
get qualities(): Quality[]
```

Qualities list of the primary asset.

###### Returns

[`Quality`](/frontend/player#quality)[]

##### ready

```ts
get ready(): boolean
```

We're ready when the master playlist is loaded.

###### Returns

`boolean`

##### started

```ts
get started(): boolean
```

We're started when atleast 1 asset started playback, either the master
or interstitial playlist started playing.

###### Returns

`boolean`

##### subtitleTracks

```ts
get subtitleTracks(): SubtitleTrack[]
```

Subtitle tracks of the primary asset.

###### Returns

[`SubtitleTrack`](/frontend/player#subtitletrack)[]

##### time

```ts
get time(): number
```

Time of the primary asset.

###### Returns

`number`

##### volume

```ts
get volume(): number
```

Volume across all assets.

###### Returns

`number`

#### Methods

##### destroy()

```ts
destroy(): void
```

Destroys the facade.

###### Returns

`void`

##### off()

```ts
off<E>(event, listener): void
```

###### Type Parameters

| Type Parameter                                                                  |
| ------------------------------------------------------------------------------- |
| `E` _extends_ keyof [`HlsFacadeListeners`](/frontend/player#hlsfacadelisteners) |

###### Parameters

| Parameter  | Type                                                               |
| ---------- | ------------------------------------------------------------------ |
| `event`    | `E`                                                                |
| `listener` | [`HlsFacadeListeners`](/frontend/player#hlsfacadelisteners)\[`E`\] |

###### Returns

`void`

##### on()

```ts
on<E>(event, listener): void
```

###### Type Parameters

| Type Parameter                                                                  |
| ------------------------------------------------------------------------------- |
| `E` _extends_ keyof [`HlsFacadeListeners`](/frontend/player#hlsfacadelisteners) |

###### Parameters

| Parameter  | Type                                                               |
| ---------- | ------------------------------------------------------------------ |
| `event`    | `E`                                                                |
| `listener` | [`HlsFacadeListeners`](/frontend/player#hlsfacadelisteners)\[`E`\] |

###### Returns

`void`

##### playOrPause()

```ts
playOrPause(): void
```

Toggles play or pause.

###### Returns

`void`

##### seekTo()

```ts
seekTo(targetTime): void
```

Seek to a time in primary content.

###### Parameters

| Parameter    | Type     | Description |
| ------------ | -------- | ----------- |
| `targetTime` | `number` |             |

###### Returns

`void`

##### setAudioTrack()

```ts
setAudioTrack(id): void
```

Sets audio by id. All audio tracks are defined in `audioTracks`.

###### Parameters

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `number` |             |

###### Returns

`void`

##### setQuality()

```ts
setQuality(height): void
```

Sets quality by id. All quality levels are defined in `qualities`.

###### Parameters

| Parameter | Type               | Description |
| --------- | ------------------ | ----------- |
| `height`  | `null` \| `number` |             |

###### Returns

`void`

##### setSubtitleTrack()

```ts
setSubtitleTrack(id): void
```

Sets subtitle by id. All subtitle tracks are defined in `subtitleTracks`.

###### Parameters

| Parameter | Type               | Description |
| --------- | ------------------ | ----------- |
| `id`      | `null` \| `number` |             |

###### Returns

`void`

##### setVolume()

```ts
setVolume(volume): void
```

Sets volume.

###### Parameters

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `volume`  | `number` |             |

###### Returns

`void`

## Type Aliases

### AudioTrack

```ts
type AudioTrack: object;
```

Defines an audio track.

#### Type declaration

| Name     | Type            |
| -------- | --------------- |
| `active` | `boolean`       |
| `id`     | `number`        |
| `label`  | `string`        |
| `track`  | `MediaPlaylist` |

---

### AudioTracksChangeEventData

```ts
type AudioTracksChangeEventData: object;
```

#### Type declaration

| Name          | Type                                          |
| ------------- | --------------------------------------------- |
| `audioTracks` | [`AudioTrack`](/frontend/player#audiotrack)[] |

---

### AutoQualityChangeEventData

```ts
type AutoQualityChangeEventData: object;
```

#### Type declaration

| Name          | Type      |
| ------------- | --------- |
| `autoQuality` | `boolean` |

---

### CustomInterstitialType

```ts
type CustomInterstitialType: "ad" | "bumper";
```

A custom type for each `ASSET`.

---

### HlsFacadeListeners

```ts
type HlsFacadeListeners: object;
```

List of events with their respective event handlers.

#### Type declaration

| Name                   | Type               |
| ---------------------- | ------------------ |
| `*`                    | () => `void`       |
| `audioTracksChange`    | (`data`) => `void` |
| `autoQualityChange`    | (`data`) => `void` |
| `playheadChange`       | (`data`) => `void` |
| `qualitiesChange`      | (`data`) => `void` |
| `ready`                | () => `void`       |
| `reset`                | () => `void`       |
| `subtitleTracksChange` | (`data`) => `void` |
| `timeChange`           | (`data`) => `void` |
| `volumeChange`         | (`data`) => `void` |

---

### HlsFacadeOptions

```ts
type HlsFacadeOptions: object;
```

#### Type declaration

| Name                    | Type      |
| ----------------------- | --------- |
| `multipleVideoElements` | `boolean` |

---

### Interstitial

```ts
type Interstitial: object;
```

Defines an interstitial, which is not the primary content.

#### Type declaration

| Name       | Type                                                                |
| ---------- | ------------------------------------------------------------------- |
| `duration` | `number`                                                            |
| `player`   | `HlsAssetPlayer`                                                    |
| `time`     | `number`                                                            |
| `type`?    | [`CustomInterstitialType`](/frontend/player#custominterstitialtype) |

---

### Playhead

```ts
type Playhead:
  | "idle"
  | "play"
  | "playing"
  | "pause"
  | "ended";
```

State of playhead across all assets.

---

### PlayheadChangeEventData

```ts
type PlayheadChangeEventData: object;
```

#### Type declaration

| Name       | Type                                      |
| ---------- | ----------------------------------------- |
| `playhead` | [`Playhead`](/frontend/player#playhead-1) |
| `started`  | `boolean`                                 |

---

### QualitiesChangeEventData

```ts
type QualitiesChangeEventData: object;
```

#### Type declaration

| Name        | Type                                    |
| ----------- | --------------------------------------- |
| `qualities` | [`Quality`](/frontend/player#quality)[] |

---

### Quality

```ts
type Quality: object;
```

Defines a quality level.

#### Type declaration

| Name     | Type      |
| -------- | --------- |
| `active` | `boolean` |
| `height` | `number`  |
| `levels` | `Level`[] |

---

### State

```ts
type State: object;
```

State variables.

#### Type declaration

| Name             | Type                                                |
| ---------------- | --------------------------------------------------- |
| `audioTracks`    | [`AudioTrack`](/frontend/player#audiotrack)[]       |
| `autoQuality`    | `boolean`                                           |
| `duration`       | `number`                                            |
| `playhead`       | [`Playhead`](/frontend/player#playhead-1)           |
| `qualities`      | [`Quality`](/frontend/player#quality)[]             |
| `started`        | `boolean`                                           |
| `subtitleTracks` | [`SubtitleTrack`](/frontend/player#subtitletrack)[] |
| `time`           | `number`                                            |
| `volume`         | `number`                                            |

---

### SubtitleTrack

```ts
type SubtitleTrack: object;
```

Defines an in-band subtitle track.

#### Type declaration

| Name     | Type            |
| -------- | --------------- |
| `active` | `boolean`       |
| `id`     | `number`        |
| `label`  | `string`        |
| `track`  | `MediaPlaylist` |

---

### SubtitleTracksChangeEventData

```ts
type SubtitleTracksChangeEventData: object;
```

#### Type declaration

| Name             | Type                                                |
| ---------------- | --------------------------------------------------- |
| `subtitleTracks` | [`SubtitleTrack`](/frontend/player#subtitletrack)[] |

---

### TimeChangeEventData

```ts
type TimeChangeEventData: object;
```

#### Type declaration

| Name       | Type     |
| ---------- | -------- |
| `duration` | `number` |
| `time`     | `number` |

---

### VolumeChangeEventData

```ts
type VolumeChangeEventData: object;
```

#### Type declaration

| Name     | Type     |
| -------- | -------- |
| `volume` | `number` |
