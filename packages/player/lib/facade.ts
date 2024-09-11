import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import type {
  InterstitialsManager,
  InterstitialScheduleItem,
  InterstitialAssetStartedData,
  HlsListeners,
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

  private mgr_?: InterstitialsManager;

  private timerId_?: number;

  private batchTimerId_?: number;

  private media_?: HTMLMediaElement;

  private hlsListeners_: $HlsListener[] = [];

  private mediaListeners_: $MediaListener[] = [];

  private intervalId_?: number;

  constructor(public hls: Hls) {
    super();

    this.intervalId_ = setInterval(() => {
      if (!hls.interstitialsManager || !hls.media) {
        return;
      }

      clearInterval(this.intervalId_);

      this.mgr_ = hls.interstitialsManager;
      this.media_ = hls.media;

      this.initState_();

      this.initMediaListeners_();
      this.initHlsListeners_();
    });
  }

  private initMediaListeners_() {
    this.mediaOn_("play", () => {
      this.setState_({ playheadState: "play" });
      this.pollTime_();
    });

    this.mediaOn_("pause", () => {
      this.setState_({ playheadState: "pause" });
      this.pollTime_();
    });

    this.mediaOn_("seeked", () => {
      this.pollTime_();
    });
  }

  private initHlsListeners_() {
    this.hlsOn_(Hls.Events.MEDIA_ENDED, () => {
      clearTimeout(this.timerId_);
      this.setState_({ playheadState: "ended", time: this.state?.duration });
    });

    this.hlsOn_(Hls.Events.LEVEL_SWITCHING, () => {
      assert(this.state);

      updateActive_(
        this.state.qualities,
        (quality) => quality.id - 1 === this.hls.nextLoadLevel,
        (qualities) => {
          this.setState_({ qualities });
        },
      );
    });

    this.hlsOn_(Hls.Events.AUDIO_TRACK_SWITCHING, () => {
      assert(this.state);

      updateActive_(
        this.state.audioTracks,
        (audioTrack) => audioTrack.id - 1 === this.hls.audioTrack,
        (audioTracks) => {
          this.setState_({ audioTracks });
        },
      );
    });

    this.hlsOn_(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
      assert(this.state);

      updateActive_(
        this.state.subtitleTracks,
        (subtitleTrack) => subtitleTrack.id - 1 === this.hls.subtitleTrack,
        (subtitleTracks) => {
          this.setState_({ subtitleTracks });
        },
      );
    });

    this.hlsOn_(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      const listItem = getAssetListItem(data);
      const slot: Slot = {
        type: listItem.type,
        time: data.player.currentTime,
        duration: data.player.duration,
      };
      this.setState_({ slot });
      this.pollTime_();
    });

    this.hlsOn_(Hls.Events.INTERSTITIAL_ASSET_ENDED, () => {
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
      playheadState: "idle",
      time: 0,
      duration: 0,
      cuePoints,
      qualities,
      autoQuality: this.hls.autoLevelEnabled,
      audioTracks,
      subtitleTracks,
      slot: null,
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

    const media = this.media_;
    this.mediaListeners_.forEach(([type, listener]) => {
      media?.removeEventListener(type, listener);
    });
    this.mediaListeners_ = [];

    this.hlsListeners_.forEach(([event, listener]) => {
      this.hls.off(event, listener);
    });
    this.hlsListeners_ = [];

    this.media_ = undefined;
    this.mgr_ = undefined;
    this.state = null;
  }

  playOrPause() {
    assert(this.state);
    assert(this.media_);

    if (this.state.playheadState === "play") {
      this.media_.pause();
    } else {
      this.media_.play();
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

  private hlsOn_<E extends keyof HlsListeners>(
    event: E,
    listener: HlsListeners[E],
  ) {
    this.hls.on(event, listener);
    this.hlsListeners_.push([event, listener]);
  }

  private mediaOn_<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => void,
  ) {
    assert(this.media_);
    this.media_.addEventListener(type, listener);
    // @ts-expect-error
    this.mediaListeners_.push([type, listener]);
  }
}

function assert<T>(
  value: T,
  message: string = "value is null",
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw Error(message);
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

type $HlsListener<E extends keyof HlsListeners = keyof HlsListeners> = [
  event: E,
  listener: HlsListeners[E],
];

type $MediaListener<
  K extends keyof HTMLMediaElementEventMap = keyof HTMLMediaElementEventMap,
> = [
  type: K,
  listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => void,
];
