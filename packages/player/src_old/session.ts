import Hls from "hls.js";
import { EventManager } from "./event-manager";
import { preciseFloat, getAssetListItem } from "./utils/helpers";
import { Poller } from "./utils/poller";
import { assert } from "./assert";
import { HlsChunk } from "./hls-chunk";
import { updateActive } from "./utils/helpers";
import type { HlsChunkEvents, HlsChunkParams } from "./hls-chunk";
import type {
  AudioTrack,
  PlayheadState,
  Quality,
  Slot,
  SubtitleTrack,
} from "./types";
import type { HlsFacade } from "./facade";

export class Session {
  private hlsEvents_: EventManager<Hls["on"], Hls["off"]>;

  private timePoller_: Poller;

  private hlsChunk_: HlsChunk;

  playheadState: PlayheadState = "idle";

  started = false;

  time = NaN;

  duration = NaN;

  volume = 1;

  slot: Slot | null = null;

  autoQuality = true;

  qualities: Quality[] = [];

  audioTracks: AudioTrack[] = [];

  subtitleTracks: SubtitleTrack[] = [];

  cuePoints: number[] = [];

  constructor(private facade_: HlsFacade) {
    this.timePoller_ = new Poller(250, () => this.probeTime_());

    const hls = this.hls_;

    this.hlsChunk_ = this.setHlsChunk_({ hls });

    this.hlsEvents_ = new EventManager({
      on: hls.on.bind(hls),
      off: hls.off.bind(hls),
    });

    this.setPrimaryListeners_();

    this.updateQualities_(true);
  }

  private setPrimaryListeners_() {
    this.hlsEvents_.on(Hls.Events.LEVELS_UPDATED, () => {
      this.updateQualities_(true);
    });

    this.hlsEvents_.on(Hls.Events.LEVEL_SWITCHING, () => {
      this.updateQualities_(false);
    });

    this.hlsEvents_.on(Hls.Events.MEDIA_ENDED, () => {
      this.playheadState = "ended";
      this.emit_("*");
    });

    this.hlsEvents_.on(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      this.setHlsChunk_({ hls: this.hls_, assetPlayer: data.player });

      const listItem = getAssetListItem(data);
      this.slot = {
        type: listItem.type,
        time: NaN,
        duration: NaN,
      };

      this.timePoller_.run();
    });

    this.hlsEvents_.on(Hls.Events.INTERSTITIAL_ASSET_ENDED, () => {
      this.slot = null;
      this.emit_("*");
    });

    this.hlsEvents_.on(Hls.Events.INTERSTITIALS_PRIMARY_RESUMED, () => {
      this.setHlsChunk_({ hls: this.hls_ });
    });
  }

  playOrPause() {
    assert(this.hlsChunk_);
    if (this.playheadState === "play") {
      this.hlsChunk_.media.pause();
    } else {
      this.hlsChunk_.media.play();
    }
  }

  seekTo(targetTime: number) {
    if (this.hls_.interstitialsManager) {
      this.hls_.interstitialsManager.primary.seekTo(targetTime);
    } else {
      assert(this.hlsChunk_);
      this.hlsChunk_.media.currentTime = targetTime;
    }
  }

  setVolume(volume: number) {
    assert(this.hlsChunk_);
    this.hlsChunk_.media.volume = volume;
  }

  setQuality(height: number | null) {
    if (height === null) {
      this.hls_.nextLevel = -1;
      this.updateQualities_(false);
    } else {
      const loadLevel = this.hls_.levels[this.hls_.loadLevel];
      assert(loadLevel);

      const idx = this.hls_.levels.findIndex((level) => {
        return level.height === height && level.codecSet === loadLevel.codecSet;
      });

      this.hls_.nextLevel = idx;
      this.updateQualities_(false);
    }
  }

  setSubtitleTrack(id: number | null) {
    if (id === null) {
      this.hls_.subtitleTrack = -1;
      return;
    }
    const subtitleTrack = this.hls_.allSubtitleTracks[id];
    this.hls_.setSubtitleOption({
      lang: subtitleTrack.lang,
      name: subtitleTrack.name,
    });
  }

  setAudioTrack(id: number) {
    const audioTrack = this.hls_.allAudioTracks[id];
    this.hls_.setAudioOption({
      lang: audioTrack.lang,
      channels: audioTrack.channels,
      name: audioTrack.name,
    });
  }

  dispose() {
    this.hlsEvents_.releaseAll();
    this.timePoller_.stop();
  }

  private probeTime_() {
    const { hls, media } = this.facade_;

    let time = media.currentTime;
    let duration = media.duration;

    if (hls.interstitialsManager) {
      const { primary } = hls.interstitialsManager;
      time = primary.currentTime;
      duration = primary.duration;
    }

    time = preciseFloat(time);
    duration = preciseFloat(duration);

    let fireUpdate = false;

    if (time !== this.time || duration !== this.duration) {
      this.time = time;
      this.duration = duration;
      fireUpdate = true;
    }

    if (this.slot) {
      assert(this.hlsChunk_.assetPlayer);

      let slotTime = preciseFloat(this.hlsChunk_.assetPlayer.currentTime);
      let slotDuration = preciseFloat(this.hlsChunk_.assetPlayer.duration);

      if (slotTime !== this.slot.time || slotDuration !== this.slot.duration) {
        this.slot = {
          ...this.slot,
          time: slotTime,
          duration: slotDuration,
        };
        fireUpdate = true;
      }
    }

    if (fireUpdate) {
      this.facade_.emit("*");
    }
  }

  private setHlsChunk_(params: HlsChunkParams) {
    this.hlsChunk_?.dispose();

    const events: HlsChunkEvents = {
      onBufferCreated: () => this.timePoller_.run(),
      onPlayheadStateChange: (playheadState) => {
        this.playheadState = playheadState;

        if (playheadState === "play") {
          this.started = true;
        }

        this.timePoller_.run();
        this.emit_("*");
      },
      onSeeked: () => this.timePoller_.run(),
      onVolumeChange: (volume) => {
        this.volume = volume;
        this.emit_("*");
      },
    };

    const chunk = (this.hlsChunk_ = new HlsChunk(params, events));
    return chunk;
  }

  private get hls_() {
    return this.facade_.hls;
  }

  private emit_(...args: Parameters<HlsFacade["emit"]>) {
    this.facade_.emit(...args);
  }

  private updateQualities_(reset: boolean) {
    const nextLoadLevel = this.hls_.levels[this.hls_.nextLoadLevel];

    this.autoQuality = this.hls_.autoLevelEnabled;

    if (reset) {
      const resolutions: number[] = [];
      for (const level of this.hls_.levels) {
        if (resolutions.includes(level.height)) {
          continue;
        }
        resolutions.push(level.height);
      }

      this.qualities = resolutions
        .map((resolution) => ({
          height: resolution,
          active: false,
        }))
        .sort((a, b) => b.height - a.height);
    }

    this.qualities = updateActive(
      this.qualities,
      (quality) => quality.height === nextLoadLevel?.height,
    );

    this.emit_("*");
  }
}
