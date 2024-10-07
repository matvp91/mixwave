import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { assert } from "./assert";
import { EventManager } from "./event-manager";
import type {
  InterstitialsManager,
  InterstitialScheduleItem,
  InterstitialAssetStartedData,
} from "hls.js";
import type {
  Anything,
  MixType,
  Quality,
  AudioTrack,
  SubtitleTrack,
  Slot,
  Events,
  State,
} from "./types";

export class HlsFacade extends EventEmitter<Events> {
  state: State | null = null;

  private media_: HTMLMediaElement;

  private mgr_?: InterstitialsManager;

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

    assert(hls.media, "Missing hls.media");
    this.media_ = hls.media;

    this.hlsEvents_ = new EventManager({
      on: this.hls.on.bind(hls),
      off: this.hls.off.bind(hls),
    });

    this.mediaEvents_ = new EventManager({
      on: this.media_.addEventListener.bind(this.media_),
      off: this.media_.removeEventListener.bind(this.media_),
    });

    const onInit = () => {
      this.hlsEvents_.off(Hls.Events.INTERSTITIALS_PRIMARY_RESUMED, onInit);
      this.hlsEvents_.off(Hls.Events.INTERSTITIALS_UPDATED, onInit);

      assert(hls.interstitialsManager, "Missing hls.interstitialsManager");

      this.mgr_ = hls.interstitialsManager;

      this.initState_();

      this.initMediaListeners_();
      this.initHlsListeners_();
    };

    this.hlsEvents_.on(Hls.Events.INTERSTITIALS_PRIMARY_RESUMED, onInit);
    this.hlsEvents_.on(Hls.Events.INTERSTITIALS_UPDATED, onInit);
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
    this.hlsEvents_.on(Hls.Events.MEDIA_ENDED, () => {
      clearTimeout(this.timerId_);
      this.setState_({ playheadState: "ended", time: this.state?.duration });
    });

    this.hlsEvents_.on(Hls.Events.LEVEL_SWITCHING, () => {
      assert(this.state);

      updateActive_(
        this.state.qualities,
        (quality) => quality.id - 1 === this.hls.nextLoadLevel,
        (qualities) => {
          this.setState_({ qualities });
        },
      );
    });

    this.hlsEvents_.on(Hls.Events.AUDIO_TRACK_SWITCHING, () => {
      assert(this.state);

      updateActive_(
        this.state.audioTracks,
        (audioTrack) => audioTrack.id - 1 === this.hls.audioTrack,
        (audioTracks) => {
          this.setState_({ audioTracks });
        },
      );
    });

    this.hlsEvents_.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
      assert(this.state);

      updateActive_(
        this.state.subtitleTracks,
        (subtitleTrack) => subtitleTrack.id - 1 === this.hls.subtitleTrack,
        (subtitleTracks) => {
          this.setState_({ subtitleTracks });
        },
      );
    });

    this.hlsEvents_.on(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      const listItem = getAssetListItem(data);
      const slot: Slot = {
        type: listItem.type,
        time: data.player.currentTime,
        duration: data.player.duration,
      };
      this.setState_({ slot });
      this.pollTime_();
    });

    this.hlsEvents_.on(Hls.Events.INTERSTITIAL_ASSET_ENDED, () => {
      this.setState_({ slot: null });
    });
  }

  private initState_() {
    assert(this.mgr_);

    const cuePoints = this.mgr_.schedule.reduce<number[]>((acc, item) => {
      const types = getTypes(item);
      if (types?.ad && !acc.includes(item.start)) {
        acc.push(item.start);
      }
      return acc;
    }, []);

    const qualities = this.hls.levels
      .map<Quality>((level, index) => ({
        id: index + 1,
        active: index === this.hls.nextLoadLevel,
        level,
      }))
      .sort((a, b) => b.level.height - a.level.height);

    const audioTracks = this.hls.audioTracks.map<AudioTrack>(
      (audioTrack, index) => ({
        id: index + 1,
        active: index === this.hls.audioTrack,
        playlist: audioTrack,
      }),
    );

    const subtitleTracks = this.hls.subtitleTracks.map<SubtitleTrack>(
      (subtitleTrack, index) => ({
        id: index + 1,
        active: index === this.hls.subtitleTrack,
        playlist: subtitleTrack,
      }),
    );

    this.state = {
      isStarted: false,
      playheadState: "idle",
      time: 0,
      duration: 0,
      cuePoints,
      qualities,
      autoQuality: this.hls.autoLevelEnabled,
      audioTracks,
      subtitleTracks,
      slot: null,
      volume: this.media_.volume,
    };

    this.pollTime_();
  }

  private setState_(state: Partial<State>) {
    assert(this.state);
    this.state = { ...this.state, ...state };

    // Basic batch mechanism if we call setState_ in the same time tick.
    clearTimeout(this.batchTimerId_);
    this.batchTimerId_ = setTimeout(() => {
      this.emit("*");
    }, 0);
  }

  private pollTime_ = () => {
    assert(this.mgr_);
    assert(this.state);

    clearTimeout(this.timerId_);
    this.timerId_ = setTimeout(this.pollTime_, 250);

    const { primary } = this.mgr_;
    if (
      primary.currentTime !== this.state.time ||
      primary.duration !== this.state.duration
    ) {
      this.setState_({
        time: preciseFloat(primary.currentTime),
        duration: preciseFloat(primary.duration),
      });
    }

    const { bufferingPlayer } = this.mgr_;
    if (
      bufferingPlayer &&
      this.state.slot &&
      (bufferingPlayer.currentTime !== this.state.slot.time ||
        bufferingPlayer.duration !== this.state.slot.duration)
    ) {
      this.setState_({
        slot: {
          ...this.state.slot,
          time: bufferingPlayer.currentTime,
          duration: bufferingPlayer.duration,
        },
      });
    }
  };

  dispose() {
    clearTimeout(this.timerId_);
    clearInterval(this.intervalId_);

    this.hlsEvents_.releaseAll();
    this.mediaEvents_.releaseAll();

    this.mgr_ = undefined;
    this.state = null;
  }

  playOrPause() {
    assert(this.state);
    assert(this.media_);

    if (this.state.playheadState === "play") {
      this.media_.pause();
      this.setState_({ playheadState: "pause" });
    } else {
      this.media_.play();
      this.setState_({ isStarted: true, playheadState: "play" });
    }
  }

  seekTo(targetTime: number) {
    assert(this.mgr_);
    const SAFE_OFFSET = 0.1;
    if (targetTime > this.mgr_.integrated.duration - SAFE_OFFSET) {
      targetTime = this.mgr_.integrated.duration - SAFE_OFFSET;
    }
    this.mgr_.integrated.seekTo(targetTime);
  }

  setVolume(volume: number) {
    this.media_.volume = volume;
  }

  setQuality(id: number | null) {
    this.setState_({ autoQuality: id === null });
    this.hls.nextLevel = id ? id - 1 : -1;
  }

  setSubtitleTrack(id: number | null) {
    this.hls.subtitleTrack = id ? id - 1 : -1;
  }

  setAudioTrack(id: number | null) {
    this.hls.audioTrack = id ? id - 1 : -1;
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
  const assetListItem =
    data.event.assetListResponse?.ASSETS[data.assetListIndex];

  return {
    type: (assetListItem as Anything)?.["MIX-TYPE"],
  };
}
