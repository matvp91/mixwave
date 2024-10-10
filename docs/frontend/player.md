---
next:
  text: "Frontend: Dashboard"
  link: "/frontend/dashboard"
---

# Player

We built a couple of tools to simplify working with HLS streams through [HLS.js](https://github.com/video-dev/hls.js) and HLS Interstitials. HLS.js is primarily a streaming library and can get tricky once you dive into the details. We tried to abstract away these details by providing a simple `HlsFacade` wrapper. Since you provide an `Hls` instance yourself, you're still in full control to do as you please. Our goal is not to abstract away the neat HLS.js API, but rather build an extension that simplifies certain things like quality selection, reading interstitial state, events, ...

> [!CAUTION]
> Today we rely on a fork of HLS.js - [@mixwave/hls.js](https://www.npmjs.com/package/@mixwave/hls.js), this is an unreleased build of HLS.js with interstitials support. Once `v1.6.0` ([see progress](https://github.com/video-dev/hls.js/milestone/80)) is released, we'll deprecate our fork.

<video class="video-frame" src="/video/Player.mp4" loop muted autoplay></video>

## Installation

```sh
npm i @mixwave/hls.js
npm i @mixwave/player
```

## Facade

```typescript
import Hls from "@mixwave/hls.js";
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
import Hls from "@mixwave/hls.js";
import { HlsUi, HlsFacade } from "@mixwave/player";

export function PlayerControls() {
  const ref = useRef<HTMLDivElement>(null);
  const [facade, setFacade] = useState<HlsFacade | null>(null);

  useEffect(() => {
    const hls = new Hls();
    hls.attachMedia(ref.current!);

    const facade = new HlsFacade(hls, ref.current!);

    // Bind it so we trigger a re-render, this time with a valid facade meant
    // for the HlsUi component.
    setFacade(facade);

    return () => {
      // Dispose facade first before we destroy the Hls instance.
      facade.dispose();
      hls.destroy();
    };
  }, []);

  return (
    <div
      className="relative aspect-video bg-black overflow-hidden"
      data-mix-container
    >
      <video ref={ref} className="absolute inset-O w-full h-full" />
      {facade ? <HlsUi facade={facade} /> : null}
    </div>
  );
}
```

## Example

If you want to see a running example, check [StackBlitz - Mixwave Player Demo](https://stackblitz.com/edit/mixwave-player-demo).

## Classes

### HlsFacade

Hls facade

#### Extends

- `EventEmitter`\<[`Events`](#events)\>

#### Constructors

##### new HlsFacade()

```ts
new HlsFacade(hls): HlsFacade
```

###### Parameters

| Parameter | Type  |
| --------- | ----- |
| `hls`     | `Hls` |

###### Returns

[`HlsFacade`](#hlsfacade)

###### Overrides

`default_2<Events>.constructor`

#### Properties

| Property | Type                        |
| -------- | --------------------------- |
| `hls`    | `Hls`                       |
| `state`  | `null` \| [`State`](#state) |

#### Methods

##### dispose()

```ts
dispose(): void
```

When called, the facade can no longer be used and is ready for garbage
collection. Make sure to dispose the facade before `hls.destroy()`.

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

Sets audio by id. All audio tracks are defined in `State`.

###### Parameters

| Parameter | Type               | Description |
| --------- | ------------------ | ----------- |
| `id`      | `null` \| `number` |             |

###### Returns

`void`

##### setQuality()

```ts
setQuality(id): void
```

Sets quality by id. All quality levels are defined in `State`.

###### Parameters

| Parameter | Type               | Description |
| --------- | ------------------ | ----------- |
| `id`      | `null` \| `number` |             |

###### Returns

`void`

##### setSubtitleTrack()

```ts
setSubtitleTrack(id): void
```

Sets subtitle by id. All subtitle tracks are defined in `State`.

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

| Name       | Type            | Description                    |
| ---------- | --------------- | ------------------------------ |
| `active`   | `boolean`       | -                              |
| `id`       | `number`        | -                              |
| `playlist` | `MediaPlaylist` | The playlist defined in HLS.js |

---

### Events

```ts
type Events: object;
```

#### Type declaration

| Name | Type         |
| ---- | ------------ |
| `*`  | () => `void` |

---

### Metadata

```ts
type Metadata: object;
```

#### Type declaration

| Name        | Type     |
| ----------- | -------- |
| `subtitle`? | `string` |
| `title`?    | `string` |

---

### MixType

```ts
type MixType: "ad" | "bumper";
```

A custom type for each `ASSET`.

---

### Quality

```ts
type Quality: object;
```

Defines a quality level.

#### Type declaration

| Name     | Type      | Description                 |
| -------- | --------- | --------------------------- |
| `active` | `boolean` | -                           |
| `id`     | `number`  | -                           |
| `level`  | `Level`   | The level defined in HLS.js |

---

### Slot

```ts
type Slot: object;
```

Anything that is not the primary content is a slot,
they map 1 to 1 on interstitials in the HLS playlist.

#### Type declaration

| Name       | Type                  |
| ---------- | --------------------- |
| `duration` | `number`              |
| `time`     | `number`              |
| `type`?    | [`MixType`](#mixtype) |

---

### State

```ts
type State: object;
```

Player session state.
This is immutable, each state update is a new reference. Can be easily consumed by
reactive libraries such as React.

#### Type declaration

| Name             | Type                                           | Description                                      |
| ---------------- | ---------------------------------------------- | ------------------------------------------------ |
| `audioTracks`    | [`AudioTrack`](#audiotrack)[]                  | -                                                |
| `autoQuality`    | `boolean`                                      | -                                                |
| `cuePoints`      | `number`[]                                     | -                                                |
| `duration`       | `number`                                       | -                                                |
| `isStarted`      | `boolean`                                      | -                                                |
| `playheadState`  | `"idle"` \| `"play"` \| `"pause"` \| `"ended"` | -                                                |
| `qualities`      | [`Quality`](#quality)[]                        | -                                                |
| `slot`           | [`Slot`](#slot) \| `null`                      | When null, the player plays the primary content. |
| `subtitleTracks` | [`SubtitleTrack`](#subtitletrack)[]            | -                                                |
| `time`           | `number`                                       | -                                                |
| `volume`         | `number`                                       | -                                                |

---

### SubtitleTrack

```ts
type SubtitleTrack: object;
```

Defines an in-band subtitle track.

#### Type declaration

| Name       | Type            | Description                    |
| ---------- | --------------- | ------------------------------ |
| `active`   | `boolean`       | -                              |
| `id`       | `number`        | -                              |
| `playlist` | `MediaPlaylist` | The playlist defined in HLS.js |
