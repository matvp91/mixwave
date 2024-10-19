# @mixwave/player

Player is a collection of React components and a `facade` for [HLS.js](https://github.com/video-dev/hls.js), providing a unified API. It streamlines working with HLS.js by handling state management with a strong emphasis on reactivity and it provides a set of methods that make more sense for those building their own player UI.

```sh
npm i hls.js@1.6.0-beta.1
npm i @mixwave/player
```

> [!NOTE]
> Full docs available at https://matvp91.github.io/mixwave/frontend/player.html

We strongly recommend you to go to the documentation link instead of relying on this README.

The components are styled with [Tailwind](https://tailwindcss.com/), make sure you have it setup properly. Open your `tailwind.config.js` file and include the player build.

An example can be found on StackBlitz: https://stackblitz.com/edit/mixwave-player-demo

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

Render the `Controls` component in your `React` setup, as if you would with any other component. Make sure you add the right classes and the data attribute `data-mix-container` to the container.

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

You can now interact with the `Hls` instance.

```ts
hls.loadSource("https://mixwave.stream/playlist/master.m3u8");
```

The `facade` greatly simplifies working with `HLS.js`, you can definitely use it to build your own UI instead.
