import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { EventManager } from "./event-manager";
import { StateObserver } from "./state-observer";
import { assert } from "./assert";
import { getAssetListItem, getTypes } from "./helpers";
import type { StateObserverEmit } from "./state-observer";
import type { FacadeListeners, Interstitial } from "./types";
import type { HlsAssetPlayer } from "hls.js";

export class Facade {
  private emitter_ = new EventEmitter();

  private eventManager_ = new EventManager();

  private observer_: StateObserver;

  private assetObservers_ = new Map<HlsAssetPlayer, StateObserver>();

  interstitial: Interstitial | null = null;

  constructor(public hls: Hls) {
    if (!hls.media) {
      throw new Error(
        "Hls.media is not set, call attachMedia first creating a facade",
      );
    }

    this.observer_ = new StateObserver(hls, this.observerEmit_);

    const listen = this.eventManager_.listen(hls);
    listen(Hls.Events.BUFFER_RESET, this.onBufferReset_, this);
  }

  on<E extends keyof FacadeListeners>(event: E, listener: FacadeListeners[E]) {
    this.emitter_.on(event, listener);
  }

  off<E extends keyof FacadeListeners>(event: E, listener: FacadeListeners[E]) {
    this.emitter_.off(event, listener);
  }

  destroy() {
    this.reset_();
    this.observer_.destroy();
  }

  private reset_() {
    this.eventManager_.removeAll();

    this.assetObservers_.forEach((observer) => {
      observer.destroy();
    });
    this.assetObservers_.clear();
  }

  private onBufferReset_() {
    this.reset_();

    const listen = this.eventManager_.listen(this.hls);

    listen(Hls.Events.INTERSTITIALS_UPDATED, () => {
      this.observer_.requestTimeTick();
    });

    listen(Hls.Events.INTERSTITIAL_ASSET_PLAYER_CREATED, (_, data) => {
      const player = data.player;
      const observer = new StateObserver(player.hls, this.observerEmit_);
      this.assetObservers_.set(player, observer);
    });

    listen(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      const observer = this.assetObservers_.get(data.player);
      assert(observer, "No observer in asset started. This is a bug, report");

      const assetListItem = getAssetListItem(data);

      this.interstitial = {
        get time() {
          return observer.state.time;
        },
        get duration() {
          return observer.state.duration;
        },
        player: data.player,
        type: assetListItem.type,
      };
    });

    listen(Hls.Events.INTERSTITIAL_ASSET_ENDED, (_, data) => {
      this.assetObservers_.delete(data.player);
      this.interstitial = null;
    });

    listen(Hls.Events.INTERSTITIALS_PRIMARY_RESUMED, () => {
      if (this.assetObservers_.size === 0) {
        return;
      }
      throw new SyntaxError(
        "Primary resumed but asset observers are still present. " +
          "This is a bug, report",
      );
    });
  }

  private observerEmit_: StateObserverEmit = (hls, event, eventObj) => {
    if (
      this.interstitial &&
      // If we have an interstitial, we discard all events on primary.
      (this.hls === hls ||
        // If the event comes from a preloaded interstitial, discard.
        this.interstitial.player.hls !== hls)
    ) {
      return;
    }
    this.emitter_.emit(event, eventObj);
    this.emitter_.emit("*");
  };

  get activeItem() {
    if (this.interstitial) {
      const player = this.interstitial.player;
      const observer = this.assetObservers_.get(player);
      assert(observer, "Interstitial has no observer. This is a bug, report");
      return {
        media: player.media,
        state: observer.state,
      };
    }
    return this.item;
  }

  get item() {
    return {
      media: this.hls.media,
      state: this.observer_.state,
    };
  }

  get playhead() {
    return this.activeItem.state.playhead;
  }

  get started() {
    return this.activeItem.state.started;
  }

  get time() {
    return this.item.state.time;
  }

  get duration() {
    return this.item.state.duration;
  }

  get autoQuality() {
    return this.item.state.autoQuality;
  }

  get qualities() {
    return this.item.state.qualities;
  }

  get audioTracks() {
    return this.item.state.audioTracks;
  }

  get subtitleTracks() {
    return this.item.state.subtitleTracks;
  }

  get volume() {
    return this.activeItem.state.volume;
  }

  get cuePoints() {
    const manager = this.hls.interstitialsManager;
    if (!manager) {
      return [];
    }
    return manager.schedule.reduce<number[]>((acc, item) => {
      const types = getTypes(item);
      if (types?.ad && !acc.includes(item.start)) {
        acc.push(item.start);
      }
      return acc;
    }, []);
  }

  /**
   * Toggles play or pause.
   */
  playOrPause() {
    const media = this.activeItem.media;
    if (!media) {
      return;
    }
    if (this.playhead === "play" || this.playhead === "playing") {
      media.pause();
    } else {
      media.play();
    }
  }

  /**
   * Seek to a time in primary content.
   * @param targetTime
   */
  seekTo(targetTime: number) {
    if (this.hls.interstitialsManager) {
      this.hls.interstitialsManager.primary.seekTo(targetTime);
    } else if (this.hls.media) {
      this.hls.media.currentTime = targetTime;
    }
  }

  /**
   * Sets volume.
   * @param volume
   */
  setVolume(volume: number) {
    const media = this.activeItem.media;
    if (media) {
      media.volume = volume;
    }
  }

  /**
   * Sets quality by id. All quality levels are defined in `State`.
   * @param id
   */
  // @ts-ignore
  setQuality(height: number | null) {}

  /**
   * Sets subtitle by id. All subtitle tracks are defined in `State`.
   * @param id
   */
  // @ts-ignore
  setSubtitleTrack(id: number | null) {}

  /**
   * Sets audio by id. All audio tracks are defined in `State`.
   * @param id
   */
  // @ts-ignore
  setAudioTrack(id: number) {}
}
