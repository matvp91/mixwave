import { HlsFacade, HlsUi } from "../lib/main";
import Hls from "hls.js";
import ReactDOM from "react-dom/client";

const hls = new Hls({
  debug: true,
});

const mediaElement = document.querySelector("video")!;
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls);

Object.assign(window, { facade });

hls.config.startPosition = 10;

hls.loadSource(
  // "https://streamer.ams3.cdn.digitaloceanspaces.com/package/846ed9ef-b11f-43a4-9d31-0cecc1b7468c/hls/master.m3u8",
  // "https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/redundant.m3u8",
  // "http://127.0.0.1:52002/session/260c015b-966f-4cc4-8373-ab859379a27d/master.m3u8",
  // "http://127.0.0.1:52002/session/d8f508ab-8c93-41fa-9afe-63a784477d8b/master.m3u8",
  // "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  // "http://127.0.0.1:52002/session/a7b1551f-5baf-4859-b783-b3c674a77690/master.m3u8",
  // "http://127.0.0.1:52002/session/502a700c-9c75-4a17-8017-bb8a4ff41d6e/master.m3u8",
  // "http://127.0.0.1:52002/session/8cdde3ca-0e2b-4531-83f0-3694b4975751/master.m3u8",
  // "http://127.0.0.1:52002/session/f2f9c183-4ccd-4465-b9ea-2c50325d27ad/master.m3u8",
  "https://stitcher.mixwave.stream/session/882eb07a-aa21-48d9-a62c-346acb050058/master.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsUi facade={facade} />);
