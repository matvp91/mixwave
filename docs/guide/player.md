---
outline: [2,3]
---

# Player

The team behind [HLS.js](https://github.com/video-dev/hls.js/), an open-source HLS streaming library in JavaScript, does an outstanding job maintaining it. While it's an excellent resource for streaming, HLS.js is designed primarily as a streaming library, which is great if you're already familiar with HLS. However, there’s a bit of a learning curve if you're looking to build your project on top of it.

The goal of our player wrapper is to offer a simplified API alongside HLS.js, tailored for developers building a player UI, while preserving access to the powerful features that HLS.js provides. The wrapper, which we’ll refer to as _facade_ from here on, focuses on the following goals:

- Offer intuitive data structures, events, and methods tailored for developers building a player UI.
- Implement a robust state machine.
- Provide simplified player-centric methods like `playOrPause`, `setVolume`, and more.
- Support spec-compliant plugins, including features like ad signaling.

Beyond the facade, we’ve also provided useful React hooks for consuming state within components. More details will follow, but the key insight is that building a React UI on top of rapidly changing state can impact performance. Our hooks allow you to efficiently consume player state by creating small, memoized subsets of the specific state needed for each component, ensuring optimal performance.

::: tip

If you're only interested in the React bindings and components, you can skip the facade section. The React integration uses a facade internally, so there's no need for you to provide one yourself.

:::

## Live demo

What's a player page without a live demo! Have a play with it, you'll love our controls. We've hosted a sample on StackBlitz, which means you can look at the implementation code and make adjustments as you like.

<iframe class="iframe" style="aspect-ratio: 13.55 / 9;" src="https://stackblitz.com/edit/mixwave-player-demo?embed=1&file=src%2FPlayer.tsx&view=preview"></iframe>

## Installation

::: code-group

```sh [npm]
npm i hls.js@1.6.0-beta.1
npm i @superstreamer/player
```

```sh [pnpm]
pnpm add hls.js@1.6.0-beta.1
pnpm add @superstreamer/player
```

```sh [yarn]
yarn add hls.js@1.6.0-beta.1
yarn add @superstreamer/player
```

```sh [bun]
bun add hls.js@1.6.0-beta.1
bun add @superstreamer/player
```

:::

::: warning

We're currently using a beta version of HLS.js, v1.6.0-beta.1. Once the final release is available, we'll update the peer dependency accordingly.

:::

## Facade

We prefer not to call it a wrapper, since it doesn't wrap HLS.js but operates alongside it as an additional way to interact with your video. Just create a new `HlsFacade` instance and pass it your existing `Hls` instance

Start by consulting the HLS.js [docs](https://github.com/video-dev/hls.js/) first.

::: code-group

```ts [TypeScript]
import Hls from "hls.js";
import { HlsFacade } from "@superstreamer/player";

// Create an Hls & HlsFacade instance.
const hls = new Hls();
const facade = new HlsFacade(hls);

// Attach a media element.
const mediaElement = document.querySelector("video");
hls.attachMedia(mediaElement);

// Load a source.
hls.loadSource("https://domain.com/master.m3u8");
```

:::

## React

Beautiful React player controls.

### Tailwind

The components are styled with [Tailwind](https://tailwindcss.com/), make sure you have it setup properly. Open your `tailwind.config.js` file and include the player build.

::: code-group

```ts [tailwind.config.js]
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    // Add the following line:
    "./node_modules/@superstreamer/player/dist/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
};
```

:::

### Controls

We developed a React component for player controls, along with a controller hook that significantly simplifies the setup of a facade instance. If you're working with React, use the `@superstreamer/player/react` import instead.

::: code-group

```tsx [Player.tsx]
import Hls from "hls.js";
import {
  ControllerProvider,
  Controls,
  useController,
} from "@superstreamer/player/react";

export function Player() {
  const [hls] = useState(() => new Hls());
  const controller = useController(hls);

  // Controller creates a facade internally, interact with it as you please.
  const { facade } = controller;

  useEffect(() => {
    if (url) {
      hls.loadSource(url);
    }
  }, [url]);

  return (
    <ControllerProvider controller={controller}>
      <div
        className="relative aspect-video bg-black overflow-hidden"
        data-sprs-container
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

:::

### Custom components

Building your own components with Superstreamer is straightforward. We've introduced a custom hook called `useSelector` that allows you to define a subset of the facade state and scopes it to a single component. This ensures that your component only re-renders when the specified subset of state changes. This approach significantly reduces the number of re-renders in React, which is particularly important for a player where state changes frequently and rapidly over short periods.

The selector hook is available in components that have the `ControllerProvider` context as a parent.

::: code-group

```tsx [CustomTime.tsx]
import { useSelector } from "@superstreamer/player/react";

export function CustomTime() {
  const time = useSelector(facade => facade.time);
  const duration = useSelector(facade => facade.duration);

  if (!Number.isFinite(duration)) {
    // Bail out early when the duration is NaN.
    return null;
  }

  return <span>You have watched {Math.trunc(time / duration * 100)}%</span>
}
```

```tsx [Player.tsx]
// Other imports ...
import { CustomTime } from "./CustomTime";

export function Player() {
  // Other logic ...
  return (
    <ControllerProvider controller={controller}>
      <div
        className="relative aspect-video bg-black overflow-hidden"
        data-sprs-container
      >
        {/* Add your own component */}
        <CustomTime />
      </div>
    </ControllerProvider>
  )
}
```

:::