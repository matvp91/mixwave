import { useCallback, useState } from "react";
import { Facade } from ".";
import type Hls from "hls.js";

export function useFacade(hls: Hls) {
  const [facade, setFacade] = useState<Facade | null>(null);

  const mediaRef = useCallback((media: HTMLMediaElement | null) => {
    if (!media) {
      return;
    }
    hls.attachMedia(media);
    setFacade(new Facade(hls));
  }, []);

  return [mediaRef, facade] as const;
}
