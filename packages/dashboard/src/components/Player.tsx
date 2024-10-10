import Hls from "@mixwave/hls.js";
import { HlsFacade, HlsUi } from "@mixwave/player";
import { useEffect, useRef, useState } from "react";

type PlayerProps = {
  url?: string;
};

export function Player({ url }: PlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [facade, setFacade] = useState<HlsFacade | null>(null);

  useEffect(() => {
    if (!url) {
      return;
    }

    const hls = new Hls();

    hls.attachMedia(ref.current!);

    const facade = new HlsFacade(hls);

    hls.loadSource(url);

    setFacade(facade);

    return () => {
      facade.dispose();
      hls.destroy();
    };
  }, [url]);

  useEffect(() => {
    Object.assign(window, { facade });
  }, [facade]);

  return (
    <div
      className="relative aspect-video bg-black overflow-hidden"
      data-mix-container
    >
      <video ref={ref} className="absolute inset-O w-full h-full" />
      {facade ? <HlsUi facade={facade} /> : null}
    </div>
  );
}
