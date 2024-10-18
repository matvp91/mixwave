import { StateObserver } from "./state-observer";
import type Hls from "hls.js";
import type { HlsAssetPlayer } from "hls.js";
import type { StateObserverEmit } from "./state-observer";

export class Asset {
  assetPlayer?: HlsAssetPlayer;

  hls: Hls;

  private observer_: StateObserver;

  constructor(item: Hls | HlsAssetPlayer, emit: StateObserverEmit) {
    if ("hls" in item) {
      this.hls = item.hls;
      this.assetPlayer = item;
    } else {
      this.hls = item;
    }

    this.observer_ = new StateObserver(this.hls, emit);
  }

  destroy() {
    this.observer_.destroy();
  }

  get state() {
    return this.observer_.state;
  }

  get observer() {
    return this.observer_;
  }

  get media() {
    return this.hls.media;
  }
}
