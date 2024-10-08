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
