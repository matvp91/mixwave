import Hls from "hls.js";
import { Facade } from "@mixwave/player";
import { useEffect, useRef, useState } from "react";

type PlayerProps = {
  url?: string;
};

export function Player({ url }: PlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [facade, setFacade] = useState<Facade | null>(null);

  useEffect(() => {
    if (!url || !ref.current) {
      return;
    }

    const hls = new Hls({
      debug: false,
    });
    hls.attachMedia(ref.current);
    const facade = new Facade(hls);

    facade.on("*", (event) => {
      console.log(event, facade.state);
    });

    hls.loadSource(url);

    hls.on(Hls.Events.ERROR, (_, error) => {
      console.error(error);
    });

    setFacade(facade);

    return () => {
      facade.destroy();
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
      {/* {facade ? <HlsUi facade={facade} /> : null} */}
    </div>
  );
}
