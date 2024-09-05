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
  "http://127.0.0.1:52002/session/6371e172-bf65-4e7c-a0bd-b167c1256ba0/master.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsControls facade={facade} />);
