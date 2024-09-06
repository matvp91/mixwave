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
  "https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/redundant.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsUi facade={facade} />);
