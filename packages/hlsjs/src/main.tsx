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
  "http://127.0.0.1:52002/session/0eab51fd-8d36-4f87-a6c6-d17a8e0faadd/master.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsControls facade={facade} />);
