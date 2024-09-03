import { HlsFacade, HlsControls } from "../lib/main";
import Hls from "hls.js";
import ReactDOM from "react-dom/client";

const hls = new Hls();

const mediaElement = document.querySelector("video")!;
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls);

Object.assign(window, { facade });

hls.loadSource(
  "http://127.0.0.1:52002/session/28832a1d-c8c5-4840-bb7d-021f92c5edeb/master.m3u8",
);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsControls facade={facade} />);
