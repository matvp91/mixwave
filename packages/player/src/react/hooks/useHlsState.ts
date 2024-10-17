import { useSyncExternalStore, useRef } from "react";
import type { Facade } from "..";

function buildState(f: Facade) {
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
    cuePoints: [],
    interstitial: f.interstitial,
  };
}

export type StoreState = ReturnType<typeof buildState>;

class Store {
  private state_: StoreState;

  constructor(private facade_: Facade) {
    this.state_ = buildState(facade_);

    facade_.on("*", () => {
      this.state_ = buildState(facade_);
    });
  }

  subscribe = (listener: () => void) => {
    this.facade_.on("*", listener);
    return () => {
      this.facade_.off("*", listener);
    };
  };

  getSnapshot = () => this.state_;
}

export function useHlsState(facade: Facade) {
  const ref = useRef<Store>();

  if (!ref.current) {
    ref.current = new Store(facade);
  }

  return useSyncExternalStore(ref.current.subscribe, ref.current.getSnapshot);
}
