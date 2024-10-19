import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { getAssetListItem, getTypes, pipeState } from "./helpers";
import { Asset } from "./asset";
import { Events } from "./types";
import { assert } from "./assert";
import { MediaManager } from "./media-manager";
import type {
  InterstitialAssetEndedData,
  InterstitialAssetPlayerCreatedData,
  InterstitialAssetStartedData,
  HlsAssetPlayer,
} from "hls.js";
import type { StateObserverEmit } from "./state-observer";
import type {
  HlsFacadeListeners,
  Interstitial,
  PlayheadChangeEventData,
} from "./types";

export type HlsFacadeOptions = {
  multipleVideoElements: boolean;
};

/**
 * A facade wrapper that simplifies working with HLS.js API.
 */
export class HlsFacade {
  private options_: HlsFacadeOptions;

  private emitter_ = new EventEmitter();

  private primaryAsset_: Asset | null = null;

  private interstitialAssets_ = new Map<HlsAssetPlayer, Asset>();

  private state_: DominantState | null = null;

  private interstitial_: Interstitial | null = null;

  private mediaManager_: MediaManager | null = null;

  constructor(
    public hls: Hls,
    userOptions?: Partial<HlsFacadeOptions>,
  ) {
    this.options_ = {
      // Add default values.
      multipleVideoElements: false,
      ...userOptions,
    };

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
    hls.on(
      Hls.Events.INTERSTITIALS_PRIMARY_RESUMED,
      this.onInterstitialsPrimaryResumed_,
      this,
    );

    if (hls.media) {
      // We have media attached when we created the facade, fire it.
      this.onMediaAttached_();
    } else {
      // Wait once until we can grab the media.
      hls.once(Hls.Events.MEDIA_ATTACHED, this.onMediaAttached_, this);
    }
  }

  on<E extends keyof HlsFacadeListeners>(
    event: E,
    listener: HlsFacadeListeners[E],
  ) {
    this.emitter_.on(event, listener);
  }

  off<E extends keyof HlsFacadeListeners>(
    event: E,
    listener: HlsFacadeListeners[E],
  ) {
    this.emitter_.off(event, listener);
  }

  /**
   * Destroys the facade.
   */
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
    this.hls.off(
      Hls.Events.INTERSTITIALS_PRIMARY_RESUMED,
      this.onInterstitialsPrimaryResumed_,
      this,
    );
    this.hls.off(Hls.Events.MEDIA_ATTACHED, this.onMediaAttached_, this);

    this.disposeAssets_();
  }

  /**
   * We're ready when the master playlist is loaded.
   */
  get ready() {
    return this.state_ !== null;
  }

  /**
   * We're started when atleast 1 asset started playback, either the master
   * or interstitial playlist started playing.
   */
  get started() {
    return this.state_?.started ?? false;
  }

  /**
   * Returns the playhead, will preserve the user intent across interstitials.
   * When we're switching to an interstitial, and the user explicitly requested play,
   * we'll still return the state as playing.
   */
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

  /**
   * Time of the primary asset.
   */
  get time() {
    return pipeState("time", this.primaryAsset_);
  }

  /**
   * Duration of the primary asset.
   */
  get duration() {
    if (this.hls.interstitialsManager) {
      return this.hls.interstitialsManager.primary.duration;
    }
    return pipeState("duration", this.primaryAsset_);
  }

  /**
   * Whether auto quality is enabled for all assets.
   */
  get autoQuality() {
    return pipeState("autoQuality", this.primaryAsset_);
  }

  /**
   * Qualities list of the primary asset.
   */
  get qualities() {
    return pipeState("qualities", this.primaryAsset_);
  }

  /**
   * Audio tracks of the primary asset.
   */
  get audioTracks() {
    return pipeState("audioTracks", this.primaryAsset_);
  }

  /**
   * Subtitle tracks of the primary asset.
   */
  get subtitleTracks() {
    return pipeState("subtitleTracks", this.primaryAsset_);
  }

  /**
   * Volume across all assets.
   */
  get volume() {
    return pipeState("volume", this.activeAsset_);
  }

  /**
   * A list of ad cue points, can be used to plot on a seekbar.
   */
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
   * When currently playing an interstitial, this holds all the info
   * from that interstitial, such as time / duration, ...
   */
  get interstitial() {
    return this.interstitial_;
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
    // We'll pass this on to the media manager, in case we have multiple
    // media elements, we'll set volume for all.
    this.mediaManager_?.setVolume(volume);
  }

  /**
   * Sets quality by id. All quality levels are defined in `qualities`.
   * @param height
   */
  setQuality(height: number | null) {
    this.primaryAsset_?.observer.setQuality(height);
  }

  /**
   * Sets subtitle by id. All subtitle tracks are defined in `subtitleTracks`.
   * @param id
   */
  setSubtitleTrack(id: number | null) {
    this.primaryAsset_?.observer.setSubtitleTrack(id);
  }

  /**
   * Sets audio by id. All audio tracks are defined in `audioTracks`.
   * @param id
   */
  setAudioTrack(id: number) {
    this.primaryAsset_?.observer.setAudioTrack(id);
  }

  private onBufferReset_() {
    this.disposeAssets_();

    this.state_ = null;
    this.interstitial_ = null;

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
    this.mediaManager_?.attachMedia(data.player);

    const asset = new Asset(data.player, this.observerEmit_);
    this.interstitialAssets_.set(data.player, asset);
  }

  private onInterstitialAssetStarted_(
    _: string,
    data: InterstitialAssetStartedData,
  ) {
    const asset = this.interstitialAssets_.get(data.player);
    assert(asset, "No asset for interstitials player");

    this.mediaManager_?.setActive(data.player);

    const assetListItem = getAssetListItem(data);

    this.interstitial_ = {
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
    this.interstitial_ = null;
  }

  private onMediaAttached_() {
    assert(this.hls.media);

    this.mediaManager_ = new MediaManager(
      this.hls.media,
      this.options_.multipleVideoElements,
    );
  }

  private onInterstitialsPrimaryResumed_() {
    assert(this.mediaManager_);
    this.mediaManager_.reset();
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

  private dominantStateSideEffect_<E extends keyof HlsFacadeListeners>(
    event: E,
    eventObj: Parameters<HlsFacadeListeners[E]>[0],
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

  private get activeAsset_() {
    if (this.interstitial_) {
      return this.interstitialAssets_.get(this.interstitial_.player) ?? null;
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
