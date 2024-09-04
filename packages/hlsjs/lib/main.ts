import Hls from "hls.js";
import update from "immutability-helper";
import EventEmitter from "eventemitter3";
import type { Spec } from "immutability-helper";

export { HlsControls } from "./HlsControls";

export type HlsState = {
  playheadState: "idle" | "play" | "pause";
  time: number;
  duration: number;
};

export type HlsFacadeEvent = {
  "*": () => void;
};

export class HlsFacade extends EventEmitter<HlsFacadeEvent> {
  private intervalId_: number | undefined;

  constructor(public hls: Hls) {
    super();

    if (!hls.media) {
      throw new HlsFacadeNoMedia();
    }

    hls.on(Hls.Events.INTERSTITIALS_UPDATED, () => {
      this.syncState_();
    });
  }

  destroy() {
    clearInterval(this.intervalId_);
  }

  state: HlsState = {
    playheadState: "idle",
    time: NaN,
    duration: NaN,
  };

  private onTick_() {
    const { integrated } = this.getInterstitialsManager_();

    this.setState_({
      time: { $set: integrated.currentTime },
      duration: { $set: integrated.duration },
    });
  }

  playOrPause() {
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
      playheadState: { $set: shouldPause ? "pause" : "play" },
    });
  }

  seekTo(targetTime: number) {
    this.getInterstitialsManager_().integrated.seekTo(targetTime);
  }

  private setState_(spec: Spec<HlsState>) {
    const nextState = update(this.state, spec);
    if (nextState !== this.state) {
      this.state = nextState;
    }
    this.emit("*");
  }

  private getInterstitialsManager_() {
    const { interstitialsManager } = this.hls;
    if (!interstitialsManager) {
      throw new HlsFacadeNoInterstitialsManager();
    }
    return interstitialsManager;
  }

  private getMedia_() {
    const manager = this.getInterstitialsManager_();
    const media = manager.bufferingPlayer?.media ?? this.hls.media;
    if (!media) {
      throw new HlsFacadeNoMedia();
    }
    return media;
  }

  private syncState_() {
    clearInterval(this.intervalId_);
    this.intervalId_ = setInterval(() => this.onTick_(), 500);
    this.onTick_();
  }
}

export class HlsFacadeNoMedia extends Error {
  constructor() {
    super("No available media found");
  }
}

export class HlsFacadeNoInterstitialsManager extends Error {
  constructor() {
    super("No interstitials manager found");
  }
}
