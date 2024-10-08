# mixwave player

Player is a collection of React components and a `facade` for [HLS.js](https://github.com/video-dev/hls.js), providing a unified API. It streamlines working with HLS.js by handling state management with a strong emphasis on reactivity and it provides a set of methods that make more sense for those building their own player UI.

```sh
npm i hls.js
npm i @mixwave/player
```

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

Pass your `HLS.js` instance to the facade.

```ts
import Hls from "hls.js";
import { HlsFacade } from "@mixwave/player";

const hls = new Hls();
hls.attachMedia(videoElement);

const facade = new HlsFacade(hls);
```

Render the `HlsUi` component in your `React` setup, as if you would with any other component. Make sure you add the right classes and the data attribute `data-mix-container` to the container.

```tsx
import { HlsUi } from "@mixwave/player";
import type { HlsFacade } from "@mixwave/player";

type PlayerProps = {
  facade: HlsFacade;
};

function Player({ facade }: PlayerProps) {
  return (
    <div
      className="relative aspect-video bg-black overflow-hidden"
      data-mix-container
    >
      <video ref={ref} className="absolute inset-O w-full h-full" />
      <HlsUi facade={facade} />
    </div>
  );
}
```

You can now interact with the `Hls` instance.

```ts
hls.loadSource("https://mixwave.stream/playlist/master.m3u8");
```

The `facade` greatly simplifies working with `HLS.js`, you can definitely use it to build your own UI instead.

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
