import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { EventManager } from "./event-manager";
import { StateObserver } from "./state-observer";
import type { Events } from "./types";

export class Facade {
  private emitter_ = new EventEmitter<Events>();

  private eventManager_ = new EventManager();

  private observer_: StateObserver;

  private assetObserver_: StateObserver | null = null;

  constructor(public hls: Hls) {
    if (!hls.media) {
      throw new Error(
        "Hls.media is not set, call attachMedia first creating a facade",
      );
    }

    this.observer_ = new StateObserver(hls);

    const listen = this.eventManager_.listen(hls);
    listen(Hls.Events.BUFFER_RESET, this.onBufferReset_, this);
  }

  on<E extends keyof Events>(event: E, listener: Events[E]) {
    this.emitter_.on(event, listener);
  }

  off<E extends keyof Events>(event: E, listener: Events[E]) {
    this.emitter_.off(event, listener);
  }

  destroy() {
    this.eventManager_.removeAll();

    this.observer_?.destroy();

    this.assetObserver_?.destroy();
    this.assetObserver_ = null;
  }

  private onBufferReset_() {
    this.eventManager_.removeAll();

    const listen = this.eventManager_.listen(this.hls);
    listen(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      this.assetObserver_ = new StateObserver(data.player.hls);
    });

    listen(Hls.Events.INTERSTITIAL_ASSET_ENDED, () => {
      this.assetObserver_?.destroy();
      this.assetObserver_ = null;
    });
  }
}
