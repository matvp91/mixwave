import { useSyncExternalStore, useRef } from "react";
import type { HlsFacade } from "../..";
import type { State } from "../..";

class Store {
  private state_: State;

  constructor(private facade_: HlsFacade) {
    this.state_ = this.buildState_();

    facade_.on("*", () => {
      this.state_ = this.buildState_();
    });
  }

  subscribe = (listener: () => void) => {
    this.facade_.on("*", listener);
    return () => {
      this.facade_.off("*", listener);
    };
  };

  getSnapshot = () => this.state_;

  private buildState_(): State {
    const f = this.facade_;
    return {
      loaded: f.loaded,
      playheadState: f.playheadState,
      started: f.started,
      time: f.time,
      duration: f.duration,
      volume: f.volume,
      slot: f.slot,
      autoQuality: f.autoQuality,
      qualities: f.qualities,
      audioTracks: f.audioTracks,
      subtitleTracks: f.subtitleTracks,
      cuePoints: f.cuePoints,
    };
  }
}

export function useHlsState(facade: HlsFacade) {
  const ref = useRef<Store>();

  if (!ref.current) {
    ref.current = new Store(facade);
  }

  return useSyncExternalStore(ref.current.subscribe, ref.current.getSnapshot);
}
