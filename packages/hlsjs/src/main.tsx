import { HlsFacade, HlsControls } from "../lib/main";
import Hls from "hls.js";
import ReactDOM from "react-dom/client";

const hls = new Hls();

const mediaElement = document.querySelector("video")!;
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls);

Object.assign(window, { facade });

// hls.config.startPosition = 10;

hls.loadSource(
  "https://streamer.ams3.cdn.digitaloceanspaces.com/package/293e9584-f5b0-4d43-a365-ac1c5e232af8/hls/master.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsControls facade={facade} />);
