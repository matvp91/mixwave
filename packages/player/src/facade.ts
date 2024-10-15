import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { assert } from "./assert";
import { EventManager } from "./event-manager";
import type {
  InterstitialScheduleItem,
  InterstitialAssetStartedData,
  Level,
  MediaPlaylist,
} from "hls.js";
import type {
  MixType,
  AudioTrack,
  SubtitleTrack,
  Slot,
  Events,
  State,
  Quality,
} from "./types";

/**
 * Hls facade
 */
export class HlsFacade extends EventEmitter<Events> {
  state: State | null = null;

  private timerId_?: number;

  private batchTimerId_?: number;

  private intervalId_?: number;

  private hlsEvents_: EventManager<Hls["on"], Hls["off"]>;

  private mediaEvents_: EventManager<
    HTMLMediaElement["addEventListener"],
    HTMLMediaElement["removeEventListener"]
  >;

  constructor(public hls: Hls) {
    super();

    this.hlsEvents_ = new EventManager({
      on: this.hls.on.bind(hls),
      off: this.hls.off.bind(hls),
    });

    this.mediaEvents_ = new EventManager({
      on: this.media_.addEventListener.bind(this.media_),
      off: this.media_.removeEventListener.bind(this.media_),
    });

    const onManifestLoaded = () => {
      this.hlsEvents_.off(Hls.Events.MANIFEST_LOADED);

      this.initState_();

      this.initMediaListeners_();
      this.initHlsListeners_();
    };

    this.hlsEvents_.on(Hls.Events.MANIFEST_LOADED, onManifestLoaded);
  }

  private initMediaListeners_() {
    this.mediaEvents_.on("play", () => {
      this.pollTime_();
    });

    this.mediaEvents_.on("pause", () => {
      this.pollTime_();
    });

    this.mediaEvents_.on("seeked", () => {
      this.pollTime_();
    });

    this.mediaEvents_.on("volumechange", () => {
      this.setState_({ volume: this.media_.volume });
    });
  }

  private initHlsListeners_() {
    this.hlsEvents_.on(Hls.Events.INTERSTITIALS_UPDATED, (_, data) => {
      this.setState_({ cuePoints: mapCuepoints(data.schedule) });
    });

    this.hlsEvents_.on(Hls.Events.MEDIA_ENDED, () => {
      clearTimeout(this.timerId_);
      this.setState_({ playheadState: "ended", time: this.state?.duration });
    });

    this.hlsEvents_.on(Hls.Events.LEVEL_SWITCHING, (_, data) => {
      assert(this.state);

      updateActive_(
        this.state.qualities,
        (quality) => quality.height === data.height,
        (qualities) => {
          this.setState_({ qualities });
        },
      );
    });

    this.hlsEvents_.on(Hls.Events.AUDIO_TRACK_SWITCHING, () => {
      assert(this.state);

      const idx = this.getAudioTrackIdx_();
      updateActive_(
        this.state.audioTracks,
        (track) => track.id === idx,
        (audioTracks) => {
          this.setState_({ audioTracks });
        },
      );
    });

    this.hlsEvents_.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
      assert(this.state);

      const idx = this.getSubtitleTrackIdx_();
      updateActive_(
        this.state.subtitleTracks,
        (track) => track.id === idx,
        (subtitleTracks) => {
          this.setState_({ subtitleTracks });
        },
      );
    });

    this.hlsEvents_.on(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      const listItem = getAssetListItem(data);
      const slot: Slot = {
        type: listItem.type,
        time: preciseFloat(data.player.currentTime),
        duration: preciseFloat(data.player.duration),
        player: data.player,
      };
      this.setState_({ slot });
      this.pollTime_();
    });

    this.hlsEvents_.on(Hls.Events.INTERSTITIAL_ASSET_ENDED, () => {
      this.setState_({ slot: null });
    });

    this.hlsEvents_.on(Hls.Events.LEVELS_UPDATED, (_, data) => {
      this.setState_({ qualities: this.mapQualities(data.levels) });
    });

    this.hlsEvents_.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
      this.setState_({
        audioTracks: this.mapAudioTracks(),
      });
    });

    this.hlsEvents_.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
      this.setState_({
        subtitleTracks: this.mapSubtitleTracks(),
      });
    });
  }

  private initState_() {
    const timings = this.getTimings_();
    this.state = {
      isStarted: false,
      playheadState: "idle",
      time: timings.time,
      duration: timings.duration,
      cuePoints: [],
      qualities: this.mapQualities(this.hls.levels),
      autoQuality: this.hls.autoLevelEnabled,
      audioTracks: this.mapAudioTracks(),
      subtitleTracks: this.mapSubtitleTracks(),
      slot: null,
      volume: this.media_.volume,
    };

    this.emit("*");

    this.pollTime_();
  }

  private getTimings_() {
    const tuple = [this.media_.currentTime, this.media_.duration];

    if (this.hls.interstitialsManager) {
      const { primary } = this.hls.interstitialsManager;
      tuple[0] = primary.currentTime;
      tuple[1] = primary.duration;
    }

    return {
      time: preciseFloat(tuple[0]),
      duration: preciseFloat(tuple[1]),
    };
  }

  private setState_(state: Partial<State>) {
    assert(this.state);
    this.state = { ...this.state, ...state };

    // Basic batch mechanism if we call setState_ close to the last time tick.
    clearTimeout(this.batchTimerId_);
    this.batchTimerId_ = window.setTimeout(() => {
      this.emit("*");
    }, 10);
  }

  private getSlotTimings_() {
    assert(this.state);

    if (!this.state.slot) {
      return null;
    }

    const { player } = this.state.slot;
    return {
      time: preciseFloat(player.currentTime),
      duration: preciseFloat(player.duration),
    };
  }

  private pollTime_ = () => {
    assert(this.state);

    clearTimeout(this.timerId_);
    this.timerId_ = window.setTimeout(this.pollTime_, 250);

    const timings = this.getTimings_();

    if (
      this.state.time !== timings.time ||
      this.state.duration !== timings.duration
    ) {
      this.setState_({
        time: timings.time,
        duration: timings.duration,
      });
    }

    const slotTimings = this.getSlotTimings_();
    if (slotTimings) {
      assert(this.state.slot, "slotTimings is set but no state.slot");
      if (
        this.state.slot.time !== slotTimings.time ||
        this.state.slot.duration !== slotTimings.duration
      ) {
        this.setState_({
          slot: {
            ...this.state.slot,
            time: slotTimings.time,
            duration: slotTimings.duration,
          },
        });
      }
    }
  };

  private tempMediaCache_?: HTMLMediaElement;

  private get media_() {
    if (this.tempMediaCache_) {
      return this.tempMediaCache_;
    }
    assert(this.hls.media, "Missing media element");

    // This is temporary. Until we find a better way to manage (multiple) media elements.
    this.tempMediaCache_ = this.hls.media;

    return this.hls.media;
  }

  /**
   * When called, the facade can no longer be used and is ready for garbage
   * collection. Make sure to dispose the facade before `hls.destroy()`.
   */
  dispose() {
    clearTimeout(this.timerId_);
    clearInterval(this.intervalId_);

    this.hlsEvents_.releaseAll();
    this.mediaEvents_.releaseAll();

    this.state = null;
  }

  /**
   * Toggles play or pause.
   */
  playOrPause() {
    assert(this.state);

    if (this.state.playheadState === "play") {
      this.media_.pause();
      this.setState_({ playheadState: "pause" });
    } else {
      this.media_.play();
      this.setState_({ isStarted: true, playheadState: "play" });
    }
  }

  /**
   * Seek to a time in primary content.
   * @param targetTime
   */
  seekTo(targetTime: number) {
    if (this.hls.interstitialsManager) {
      this.hls.interstitialsManager.integrated.seekTo(targetTime);
    } else {
      this.media_.currentTime = targetTime;
    }
  }

  /**
   * Sets volume.
   * @param volume
   */
  setVolume(volume: number) {
    this.media_.volume = volume;
  }

  /**
   * Sets quality by id. All quality levels are defined in `State`.
   * @param id
   */
  setQuality(height: number | null) {
    this.setState_({ autoQuality: height === null });

    if (height === null) {
      this.hls.nextLevel = -1;
      return;
    }

    const currentLevel = this.hls.levels[this.hls.currentLevel];
    if (!currentLevel) {
      return;
    }

    const idx = this.hls.levels.findIndex((level) => {
      return (
        level.height === height && level.codecSet === currentLevel.codecSet
      );
    });

    this.hls.nextLevel = idx;
  }

  /**
   * Sets subtitle by id. All subtitle tracks are defined in `State`.
   * @param id
   */
  setSubtitleTrack(id: number | null) {
    if (id === null) {
      this.hls.subtitleTrack = -1;
      return;
    }
    const subtitleTrack = this.hls.allSubtitleTracks[id];
    this.hls.setSubtitleOption({
      lang: subtitleTrack.lang,
      name: subtitleTrack.name,
    });
  }

  /**
   * Sets audio by id. All audio tracks are defined in `State`.
   * @param id
   */
  setAudioTrack(id: number) {
    const audioTrack = this.hls.allAudioTracks[id];
    this.hls.setAudioOption({
      lang: audioTrack.lang,
      channels: audioTrack.channels,
      name: audioTrack.name,
    });
  }

  private mapQualities(levels: Level[]): Quality[] {
    const resolutions: number[] = [];
    for (const level of levels) {
      if (resolutions.includes(level.height)) {
        continue;
      }
      resolutions.push(level.height);
    }

    const nextLoadLevel = levels.find(
      (level) => level.id === this.hls.nextLoadLevel,
    );

    return resolutions
      .map((resolution) => ({
        height: resolution,
        active: resolution === nextLoadLevel?.height,
      }))
      .sort((a, b) => b.height - a.height);
  }

  private mapAudioTracks(): AudioTrack[] {
    const idx = this.getAudioTrackIdx_();
    return this.hls.allAudioTracks.map((track, index) => ({
      id: index,
      active: index === idx,
      lang: track.lang,
      channels: track.channels,
    }));
  }

  private mapSubtitleTracks(): SubtitleTrack[] {
    const idx = this.getSubtitleTrackIdx_();
    return this.hls.allSubtitleTracks.map((track, index) => ({
      id: index,
      active: index === idx,
      lang: track.lang,
    }));
  }

  private findIdxInAllTracks_(
    allTracks: MediaPlaylist[],
    tracks: MediaPlaylist[],
    id: number,
  ) {
    const track = tracks.find((track) => track.id === id);
    if (!track) {
      return -1;
    }
    return allTracks.indexOf(track);
  }

  private getSubtitleTrackIdx_() {
    return this.findIdxInAllTracks_(
      this.hls.allSubtitleTracks,
      this.hls.subtitleTracks,
      this.hls.subtitleTrack,
    );
  }

  private getAudioTrackIdx_() {
    return this.findIdxInAllTracks_(
      this.hls.allAudioTracks,
      this.hls.audioTracks,
      this.hls.audioTrack,
    );
  }
}

function getTypes(item: InterstitialScheduleItem) {
  if (!item.event) {
    return null;
  }
  return item.event.dateRange.attr.enumeratedStringList("X-MIX-TYPES", {
    ad: false,
    bumper: false,
  } satisfies Record<MixType, boolean>);
}

function preciseFloat(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function updateActive_<T extends { active: boolean }>(
  items: T[],
  getActive: (item: T) => boolean,
  onResult: (items: T[]) => void,
) {
  const current = items.findIndex((item) => item.active);
  const active = items.findIndex((item) => getActive(item));

  if (current === active) {
    return;
  }

  const nextItems: T[] = [];

  for (const item of items) {
    const nextActive = getActive(item);
    if (item.active === nextActive) {
      nextItems.push(item);
      continue;
    }
    nextItems.push({ ...item, active: nextActive });
  }

  onResult(nextItems);
}

function getAssetListItem(data: InterstitialAssetStartedData): {
  type?: MixType;
} {
  const assetListItem = data.event.assetListResponse?.ASSETS[
    data.assetListIndex
  ] as
    | {
        "MIX-TYPE"?: MixType;
      }
    | undefined;

  return {
    type: assetListItem?.["MIX-TYPE"],
  };
}

function mapCuepoints(schedule: InterstitialScheduleItem[]) {
  return schedule.reduce<number[]>((acc, item) => {
    const types = getTypes(item);
    if (types?.ad && !acc.includes(item.start)) {
      acc.push(item.start);
    }
    return acc;
  }, []);
}
