import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { getAssetListItem, getTypes, pipeState } from "./helpers";
import { Asset } from "./asset";
import { Events } from "./types";
import { assert } from "./assert";
import type {
  InterstitialAssetEndedData,
  InterstitialAssetPlayerCreatedData,
  InterstitialAssetStartedData,
  HlsAssetPlayer,
} from "hls.js";
import type { StateObserverEmit } from "./state-observer";
import type {
  FacadeListeners,
  Interstitial,
  PlayheadChangeEventData,
} from "./types";

export class Facade {
  private emitter_ = new EventEmitter();

  private primaryAsset_: Asset | null = null;

  private interstitialAssets_ = new Map<HlsAssetPlayer, Asset>();

  private state_: DominantState | null = null;

  interstitial: Interstitial | null = null;

  constructor(public hls: Hls) {
    hls.on(Hls.Events.BUFFER_RESET, this.onBufferReset_, this);
    hls.on(Hls.Events.MANIFEST_LOADED, this.onManifestLoaded_, this);
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
    this.hls.off(Hls.Events.MANIFEST_LOADED, this.onManifestLoaded_, this);
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

    this.state_ = null;
    this.interstitial = null;

    // In case anyone is listening, reset your state.
    this.emitter_.emit(Events.RESET);

    this.primaryAsset_ = new Asset(this.hls, this.observerEmit_);
  }

  private onManifestLoaded_() {
    this.state_ = {};
    this.emitter_.emit(Events.READY);
  }

  private onInterstitialAssetPlayerCreated_(
    _: string,
    data: InterstitialAssetPlayerCreatedData,
  ) {
    const asset = new Asset(data.player, this.observerEmit_);
    this.interstitialAssets_.set(data.player, asset);
  }

  private onInterstitialAssetStarted_(
    _: string,
    data: InterstitialAssetStartedData,
  ) {
    const asset = this.interstitialAssets_.get(data.player);
    assert(asset, "No asset for interstitials player");

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
    this.interstitialAssets_.delete(data.player);
    this.interstitial = null;
  }

  private disposeAssets_() {
    this.primaryAsset_?.destroy();
    this.primaryAsset_ = null;

    this.interstitialAssets_.forEach((asset) => {
      asset.destroy();
    });
    this.interstitialAssets_.clear();
  }

  private observerEmit_: StateObserverEmit = (hls, event, eventObj) => {
    if (hls !== this.primaryAsset_?.hls && hls !== this.activeAsset_?.hls) {
      // If it's not the primary asset, and it's not an interstitial that is currently
      // active, we skip events from it. The interstitial is still preparing.
      return;
    }

    this.dominantStateSideEffect_(event, eventObj);

    this.emitter_.emit(event, eventObj);
    this.emitter_.emit("*");
  };

  private dominantStateSideEffect_<E extends keyof FacadeListeners>(
    event: E,
    eventObj: Parameters<FacadeListeners[E]>[0],
  ) {
    if (!this.state_) {
      return;
    }

    // If we started atleast something, we've got a dominant started state.
    if (!this.state_.started && event === Events.PLAYHEAD_CHANGE) {
      const data = eventObj as PlayheadChangeEventData;
      this.state_.started = data.started;
    }
  }

  get ready() {
    return this.state_ !== null;
  }

  get started() {
    return this.state_?.started ?? false;
  }

  get playhead() {
    const playhead = pipeState("playhead", this.activeAsset_);
    if (
      (playhead === "pause" || playhead === "idle") &&
      this.state_?.playRequested
    ) {
      // We explicitly requested play, we didn't pause ourselves. Assume
      // this is an interstitial transition.
      return "playing";
    }
    return playhead;
  }

  get time() {
    return pipeState("time", this.primaryAsset_);
  }

  get duration() {
    if (this.hls.interstitialsManager) {
      return this.hls.interstitialsManager.primary.duration;
    }
    return pipeState("duration", this.primaryAsset_);
  }

  get autoQuality() {
    return pipeState("autoQuality", this.primaryAsset_);
  }

  get qualities() {
    return pipeState("qualities", this.primaryAsset_);
  }

  get audioTracks() {
    return pipeState("audioTracks", this.primaryAsset_);
  }

  get subtitleTracks() {
    return pipeState("subtitleTracks", this.primaryAsset_);
  }

  get volume() {
    return pipeState("volume", this.activeAsset_);
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
    if (!this.state_) {
      return;
    }
    const media = this.activeAsset_?.media;
    if (!media) {
      return;
    }
    if (this.playhead === "play" || this.playhead === "playing") {
      media.pause();
      this.state_.playRequested = false;
    } else {
      media.play();
      this.state_.playRequested = true;
    }
  }

  /**
   * Seek to a time in primary content.
   * @param targetTime
   */
  seekTo(targetTime: number) {
    if (this.hls.interstitialsManager) {
      this.hls.interstitialsManager.primary.seekTo(targetTime);
    } else if (this.primaryAsset_?.media) {
      this.primaryAsset_.media.currentTime = targetTime;
    }
  }

  /**
   * Sets volume.
   * @param volume
   */
  setVolume(volume: number) {
    const media = this.activeAsset_?.media;
    if (media) {
      media.volume = volume;
    }
  }

  /**
   * Sets quality by id. All quality levels are defined in `State`.
   * @param id
   */
  setQuality(height: number | null) {
    this.primaryAsset_?.observer.setQuality(height);
  }

  /**
   * Sets subtitle by id. All subtitle tracks are defined in `State`.
   * @param id
   */
  setSubtitleTrack(id: number | null) {
    this.primaryAsset_?.observer.setSubtitleTrack(id);
  }

  /**
   * Sets audio by id. All audio tracks are defined in `State`.
   * @param id
   */
  setAudioTrack(id: number) {
    this.primaryAsset_?.observer.setAudioTrack(id);
  }

  private get activeAsset_() {
    if (this.interstitial) {
      return this.interstitialAssets_.get(this.interstitial.player) ?? null;
    }
    return this.primaryAsset_;
  }
}

/**
 * Overarching state, across all assets.
 */
type DominantState = {
  started?: boolean;
  playRequested?: boolean;
};
