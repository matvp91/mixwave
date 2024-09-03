import Hls from "hls.js";
import update from "immutability-helper";
import EventEmitter from "eventemitter3";
import type { Spec } from "immutability-helper";

export { HlsControls } from "./HlsControls";

export type HlsState = {
  playheadState: "idle" | "play" | "pause";
};

export type HlsFacadeEvent = {
  "*": () => void;
};

export class HlsFacade extends EventEmitter<HlsFacadeEvent> {
  private mediaTime_ = 0;

  constructor(public hls: Hls) {
    super();
  }

  state: HlsState = {
    playheadState: "idle",
  };

  get time() {
    if (this.hls.media) {
      this.mediaTime_ = this.hls.media.currentTime;
    }
    return this.mediaTime_;
  }

  playOrPause = () => {
    const media = this.getMedia_();
    const { playheadState } = this.state;

    const shouldPause = playheadState === "play";
    if (shouldPause) {
      media.pause();
    } else {
      if (playheadState === "idle") {
        media.autoplay = true;
      }
      media.play();
    }

    this.setState_({
      $set: {
        playheadState: shouldPause ? "pause" : "play",
      },
    });
  };

  private setState_(spec: Spec<HlsState>) {
    const nextState = update(this.state, spec);
    if (nextState !== this.state) {
      this.state = nextState;
    }
    this.emit("*");
  }

  private getMedia_ = () => {
    const media =
      this.hls.interstitialsManager?.bufferingPlayer?.media ?? this.hls.media;
    if (!media) {
      throw new HlsFacadeMediaNotFoundError();
    }
    return media;
  };
}

class HlsFacadeMediaNotFoundError extends Error {
  constructor() {
    super("Media element not found");
  }
}
