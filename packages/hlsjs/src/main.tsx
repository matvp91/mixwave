import { HlsFacade, HlsUi } from "../lib/main";
import Hls from "hls.js";
import ReactDOM from "react-dom/client";

const hls = new Hls();

const mediaElement = document.querySelector("video")!;
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls);

Object.assign(window, { facade });

// hls.config.startPosition = 10;

hls.loadSource(
  // "https://streamer.ams3.cdn.digitaloceanspaces.com/package/846ed9ef-b11f-43a4-9d31-0cecc1b7468c/hls/master.m3u8",
  // "https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/redundant.m3u8",
  // "http://127.0.0.1:52002/session/260c015b-966f-4cc4-8373-ab859379a27d/master.m3u8",
  // "http://127.0.0.1:52002/session/d8f508ab-8c93-41fa-9afe-63a784477d8b/master.m3u8",
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  // "http://127.0.0.1:52002/session/a7b1551f-5baf-4859-b783-b3c674a77690/master.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsUi facade={facade} />);
