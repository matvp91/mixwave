import Hls from "hls.js";
import { Controls, useFacade } from "@mixwave/player/react";
import { useEffect } from "react";

type PlayerProps = {
  url?: string;
};

const hls = new Hls();

export function Player({ url }: PlayerProps) {
  const [videoRef, facade] = useFacade(hls);

  useEffect(() => {
    if (url) {
      hls.loadSource(url);
    }
  }, [url]);

  useEffect(() => {
    Object.assign(window, { facade });
  }, [facade]);

  return (
    <div
      className="relative aspect-video bg-black overflow-hidden"
      data-mix-container
    >
      <video ref={videoRef} className="absolute inset-O w-full h-full" />
      {facade ? <Controls facade={facade} /> : null}
    </div>
  );
}
