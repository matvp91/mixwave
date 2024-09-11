import { HlsFacade, HlsUi } from "../lib";
import Hls from "hls.js";
import ReactDOM from "react-dom/client";

const hls = new Hls({
  debug: false,
});

const mediaElement = document.querySelector("video")!;
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls);

Object.assign(window, { facade });

// hls.config.startPosition = 10;

hls.loadSource(
  // "http://127.0.0.1:52002/session/e88982c8-dd9d-4535-beea-90e55d11b027/master.m3u8",
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <HlsUi
    facade={facade}
    metadata={{
      title: "Example",
      subtitle: "Big Buck Bunny",
    }}
  />,
);
