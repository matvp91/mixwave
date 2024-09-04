import { HlsFacade, HlsControls } from "../lib/main";
import Hls from "hls.js";
import ReactDOM from "react-dom/client";

const hls = new Hls();

const mediaElement = document.querySelector("video")!;
hls.attachMedia(mediaElement);

const facade = new HlsFacade(hls);

Object.assign(window, { facade });

hls.loadSource(
  "http://127.0.0.1:52002/session/cdb7f849-5892-49f7-a778-b5cf01303061/master.m3u8",
);

// hls.loadSource("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(<HlsControls facade={facade} />);
