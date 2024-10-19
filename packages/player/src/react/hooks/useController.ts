import { useCallback, useEffect, useState, useRef } from "react";
import { HlsFacade } from "..";
import type Hls from "hls.js";

type MediaRefCallback = (media: HTMLMediaElement | null) => void;

export type Controller = ReturnType<typeof createController>;

export function useController(hls: Hls, userFacade?: HlsFacade) {
  const [facade] = useState<HlsFacade>(() => {
    if (userFacade) {
      return userFacade;
    }
    return new HlsFacade(hls);
  });

  const mediaRef = useCallback((media: HTMLMediaElement | null) => {
    if (media) {
      hls.attachMedia(media);
    }
  }, []);

  useEffect(() => {
    if (facade) {
      return () => {
        facade.destroy();
      };
    }
  }, [facade]);

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
