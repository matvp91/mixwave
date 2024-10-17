import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { EventManager } from "./event-manager";
import { StateObserver } from "./state-observer";
import { assert } from "./assert";
import type { StateObserverEmit } from "./state-observer";
import type { FacadeListeners, Interstitial } from "./types";
import type { HlsAssetPlayer } from "hls.js";

export class Facade {
  private emitter_ = new EventEmitter();

  private eventManager_ = new EventManager();

  private observer_: StateObserver;

  private assetPlayer_: HlsAssetPlayer | null = null;

  private assetObservers_ = new Map<HlsAssetPlayer, StateObserver>();

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
    this.eventManager_.removeAll();

    this.observer_.destroy();

    this.assetObservers_.forEach((observer) => {
      observer.destroy();
    });
  }

  private onBufferReset_() {
    this.eventManager_.removeAll();

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
      this.assetPlayer_ = data.player;
    });

    listen(Hls.Events.INTERSTITIAL_ASSET_ENDED, (_, data) => {
      this.assetObservers_.delete(data.player);
      this.assetPlayer_ = null;
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
      this.assetPlayer_ &&
      // If we have an assetPlayer, we discard all events on primary.
      (this.hls === hls ||
        // Emit no events when the assetPlayer is not the currently active one.
        this.assetPlayer_.hls !== hls)
    ) {
      return;
    }
    this.emitter_.emit(event, eventObj);
    this.emitter_.emit("*");
  };

  get state() {
    return this.observer_.state;
  }

  get activeMedia() {
    return this.assetPlayer_ ? this.assetPlayer_.media : this.hls.media;
  }

  get activeState() {
    const state = this.assetPlayer_
      ? this.assetObservers_.get(this.assetPlayer_)?.state
      : this.observer_.state;
    assert(state, "No active state. This is a bug, report");
    return state;
  }

  get playhead() {
    return this.activeState.playhead;
  }

  get started() {
    return this.activeState.started;
  }

  get time() {
    return this.state.time;
  }

  get duration() {
    return this.state.duration;
  }

  get autoQuality() {
    return this.activeState.autoQuality;
  }

  get qualities() {
    return this.state.qualities;
  }

  get audioTracks() {
    return this.state.audioTracks;
  }

  get subtitleTracks() {
    return this.state.subtitleTracks;
  }

  get volume() {
    return this.activeState.volume;
  }

  get interstitial() {
    return null as Interstitial | null;
  }

  /**
   * Toggles play or pause.
   */
  playOrPause() {
    if (!this.activeMedia) {
      return;
    }
    const media = this.activeMedia;
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
    if (this.activeMedia) {
      this.activeMedia.volume = volume;
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
