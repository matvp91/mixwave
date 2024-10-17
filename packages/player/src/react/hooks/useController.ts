import { useCallback, useEffect, useState, useRef } from "react";
import { Facade } from "..";
import type Hls from "hls.js";

export type Controller = ReturnType<typeof createController>;

export type State = ReturnType<typeof createState>;

export function useController(hls: Hls) {
  const [facade] = useState<Facade>(() => new Facade(hls));

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

function createController<T>(facade: Facade, mediaRef: T) {
  const listeners = new Set<() => void>();

  let lastState = createState(facade);

  facade.on("*", () => {
    lastState = createState(facade);
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

  const getSnapshot = () => lastState;

  return {
    facade,
    mediaRef,
    subscribe,
    getSnapshot,
  };
}

function createState(f: Facade) {
  return {
    playhead: f.playhead,
    started: f.started,
    time: f.time,
    duration: f.duration,
    volume: f.volume,
    autoQuality: f.autoQuality,
    qualities: f.qualities,
    audioTracks: f.audioTracks,
    subtitleTracks: f.subtitleTracks,
    cuePoints: f.cuePoints,
    interstitial: f.interstitial,
  };
}
