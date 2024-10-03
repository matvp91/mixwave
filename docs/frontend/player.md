---
next:
  text: "Frontend: Dashboard"
  link: "/frontend/dashboard"
---

# Player

We built a couple of tools to simplify working with HLS streams through HLS.js and HLS Interstitials. HLS.js is primarily a streaming library and can get tricky once you dive into the details. We tried to abstract away these details by providing a simple `HlsFacade` wrapper. Since you provide an `Hls` instance yourself, you're still in full control to do as you please. Our goal is not to abstract away the neat HLS.js API, but rather build an extension that simplifies certain things like quality selection, reading interstitial state, events, ...

<video class="video-frame" src="/dashboard-player.mp4" loop muted autoplay></video>

## Facade

```typescript
import Hls from "hls.js";
import { HlsFacade } from "@mixwave/player";

const hls = new Hls();

const mediaElement = document.querySelector("video");
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls, mediaElement);

hls.loadSource("https://domain.com/master.m3u8");

// Read playheadState or toggle play pause.
// facade.state.playheadState: "idle" | "play" | "pause" | ...
// facade.playOrPause();

// Read qualities and set a quality by id.
// facade.state.qualities
// facade.setQuality(id);
```

## UI

We primarily built the UI on top of methods and state managed by the `facade`. State exposed by the facade holds all necessary info to get you started on building your own UI, and the methods are designed in a way that it makes sense for a UI to bind directly to them (eg; `facade.playOrPause()`).

```typescript
import Hls from "hls.js";
import { HlsUi, HlsFacade } from "@mixwave/player";

export function PlayerControls() {
  const ref = useRef<HTMLDivElement>(null);
  const [facade, setFacade] = useState<HlsFacade | null>(null)

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
