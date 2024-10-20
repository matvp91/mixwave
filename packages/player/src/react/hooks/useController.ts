import { useCallback, useEffect, useRef, useState } from "react";
import { HlsFacade } from "..";
import type Hls from "hls.js";

type MediaRefCallback = (media: HTMLMediaElement | null) => void;

export type Controller = ReturnType<typeof createController>;

export function useController(hls: Hls) {
  const [facade] = useState<HlsFacade>(() => new HlsFacade(hls));
  const lastMediaRef = useRef<HTMLMediaElement | null>(null);

  useEffect(() => {
    return () => {
      if (document.body.contains(lastMediaRef.current)) {
        // If element is still in DOM, don't destroy. Omits strict mode too.
        return;
      }
      facade.destroy();
    };
  }, [facade]);

  const mediaRef = useCallback((media: HTMLMediaElement | null) => {
    lastMediaRef.current = media;
    if (media) {
      hls.attachMedia(media);
    } else {
      hls.detachMedia();
    }
  }, []);

  const controllerRef = useRef<Controller>();
  if (!controllerRef.current) {
    controllerRef.current = createController(facade, mediaRef);
  }

  return controllerRef.current;
}

function createController(facade: HlsFacade, mediaRef: MediaRefCallback) {
  const listeners = new Set<() => void>();

  let lastFacade = [facade];

  facade.on("*", () => {
    lastFacade = [facade];
    for (const listener of listeners) {
      listener();
    }
  });

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getSnapshot = () => lastFacade;

  return {
    facade,
    mediaRef,
    subscribe,
    getSnapshot,
  };
}
