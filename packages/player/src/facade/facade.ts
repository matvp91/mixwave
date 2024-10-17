import Hls from "hls.js";
import type {
  InterstitialAssetEndedData,
  InterstitialAssetPlayerCreatedData,
  InterstitialAssetStartedData,
} from "hls.js";
import EventEmitter from "eventemitter3";
import { getAssetListItem, getTypes, pipeState } from "./helpers";
import { Asset } from "./asset";
import { Events } from "./types";
import type { StateObserverEmit } from "./state-observer";
import type { FacadeListeners, Interstitial } from "./types";
import type { HlsAssetPlayer } from "hls.js";

type GenericState = {
  started: boolean;
  playRequested: boolean;
};

export class Facade {
  private emitter_ = new EventEmitter();

  private assets_ = new Set<Asset>();

  private genericState_: GenericState | null = null;

  interstitial: Interstitial | null = null;

  constructor(public hls: Hls) {
    hls.on(Hls.Events.BUFFER_RESET, this.onBufferReset_, this);
    hls.on(
      Hls.Events.INTERSTITIAL_ASSET_PLAYER_CREATED,
      this.onInterstitialAssetPlayerCreated_,
      this,
    );
    hls.on(
      Hls.Events.INTERSTITIAL_ASSET_STARTED,
      this.onInterstitialAssetStarted_,
      this,
    );
    hls.on(
      Hls.Events.INTERSTITIAL_ASSET_ENDED,
      this.onInterstitialAssetEnded_,
      this,
    );
  }

  on<E extends keyof FacadeListeners>(event: E, listener: FacadeListeners[E]) {
    this.emitter_.on(event, listener);
  }

  off<E extends keyof FacadeListeners>(event: E, listener: FacadeListeners[E]) {
    this.emitter_.off(event, listener);
  }

  destroy() {
    this.hls.off(Hls.Events.BUFFER_RESET, this.onBufferReset_, this);
    this.hls.off(
      Hls.Events.INTERSTITIAL_ASSET_PLAYER_CREATED,
      this.onInterstitialAssetPlayerCreated_,
      this,
    );
    this.hls.off(
      Hls.Events.INTERSTITIAL_ASSET_STARTED,
      this.onInterstitialAssetStarted_,
      this,
    );
    this.hls.off(
      Hls.Events.INTERSTITIAL_ASSET_ENDED,
      this.onInterstitialAssetEnded_,
      this,
    );

    this.disposeAssets_();
  }

  private onBufferReset_() {
    this.disposeAssets_();

    // In case anyone is listening, reset your state.
    this.emitter_.emit(Events.RESET);

    // Build a generic map, eg; when we started atleast 1 asset,
    // it means we started the session as a whole.
    this.genericState_ = {
      started: false,
      playRequested: false,
    };

    const primaryAsset = new Asset(this.hls, this.observerEmit_);
    this.assets_.add(primaryAsset);
  }

  private onInterstitialAssetPlayerCreated_(
    _: string,
    data: InterstitialAssetPlayerCreatedData,
  ) {
    const interstitialAsset = new Asset(data.player, this.observerEmit_);
    this.assets_.add(interstitialAsset);
  }

  private onInterstitialAssetStarted_(
    _: string,
    data: InterstitialAssetStartedData,
  ) {
    const asset = this.getAssetByPlayer(data.player);
    const assetListItem = getAssetListItem(data);

    this.interstitial = {
      get time() {
        return pipeState("time", asset);
      },
      get duration() {
        return pipeState("duration", asset);
      },
      player: data.player,
      type: assetListItem.type,
    };
  }

  private onInterstitialAssetEnded_(
    _: string,
    data: InterstitialAssetEndedData,
  ) {
    const asset = this.getAssetByPlayer(data.player);
    if (!asset) {
      throw new Error(
        "No asset for interstitials player. This is a bug, report",
      );
    }
    this.assets_.delete(asset);
    this.interstitial = null;
  }

  private disposeAssets_() {
    this.assets_.forEach((asset) => {
      asset.destroy();
    });
    this.assets_.clear();

    this.interstitial = null;
  }

  private observerEmit_: StateObserverEmit = (hls, event, eventObj) => {
    if (hls !== this.primaryAsset?.hls && hls !== this.activeAsset?.hls) {
      return;
    }

    if (
      this.genericState_ &&
      event === Events.PLAYHEAD_CHANGE &&
      this.activeAsset?.state.started
    ) {
      this.genericState_.started = true;
    }

    this.emitter_.emit(event, eventObj);
    this.emitter_.emit("*");
  };

  get started() {
    return this.genericState_?.started ?? false;
  }

  get playhead() {
    const playhead = pipeState("playhead", this.activeAsset);
    if (playhead === "pause" && this.genericState_?.playRequested) {
      // We explicitly requested play, we didn't pause ourselves. Assume
      // this is an interstitial transition.
      return "playing";
    }
    return playhead;
  }

  get time() {
    return pipeState("time", this.primaryAsset);
  }

  get duration() {
    if (this.hls.interstitialsManager) {
      return this.hls.interstitialsManager.primary.duration;
    }
    return pipeState("duration", this.primaryAsset);
  }

  get autoQuality() {
    return pipeState("autoQuality", this.primaryAsset);
  }

  get qualities() {
    return pipeState("qualities", this.primaryAsset);
  }

  get audioTracks() {
    return pipeState("audioTracks", this.primaryAsset);
  }

  get subtitleTracks() {
    return pipeState("subtitleTracks", this.primaryAsset);
  }

  get volume() {
    return pipeState("volume", this.activeAsset);
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
    if (!this.genericState_) {
      return;
    }
    const media = this.activeAsset?.hls.media;
    if (!media) {
      return;
    }
    if (this.playhead === "play" || this.playhead === "playing") {
      media.pause();
      this.genericState_.playRequested = false;
    } else {
      media.play();
      this.genericState_.playRequested = true;
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
    const media = this.activeAsset?.hls.media;
    if (media) {
      media.volume = volume;
    }
  }

  /**
   * Sets quality by id. All quality levels are defined in `State`.
   * @param id
   */
  setQuality(height: number | null) {
    this.primaryAsset?.observer.setQuality(height);
  }

  /**
   * Sets subtitle by id. All subtitle tracks are defined in `State`.
   * @param id
   */
  setSubtitleTrack(id: number | null) {
    this.primaryAsset?.observer.setSubtitleTrack(id);
  }

  /**
   * Sets audio by id. All audio tracks are defined in `State`.
   * @param id
   */
  setAudioTrack(id: number) {
    this.primaryAsset?.observer.setAudioTrack(id);
  }

  private getAssetByPlayer(player: HlsAssetPlayer) {
    for (const asset of this.assets_) {
      if (asset.assetPlayer === player) {
        return asset;
      }
    }
    return null;
  }

  get primaryAsset() {
    for (const asset of this.assets_) {
      if (!asset.assetPlayer) {
        return asset;
      }
    }
    return null;
  }

  get activeAsset() {
    if (this.interstitial) {
      return this.getAssetByPlayer(this.interstitial.player);
    }
    return this.primaryAsset;
  }
}
