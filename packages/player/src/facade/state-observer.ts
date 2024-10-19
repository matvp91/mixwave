import Hls from "hls.js";
import { EventManager } from "./event-manager";
import { updateActive, preciseFloat, getLang } from "./helpers";
import { assert } from "./assert";
import { Timer } from "./timer";
import { Events } from "./types";
import type { Level, MediaPlaylist } from "hls.js";
import type {
  Playhead,
  AudioTrack,
  HlsFacadeListeners,
  Quality,
  State,
  SubtitleTrack,
} from "./types";

export type StateObserverEmit = <E extends keyof HlsFacadeListeners>(
  hls: Hls,
  event: E,
  eventObj: Parameters<HlsFacadeListeners[E]>[0],
) => void;

export class StateObserver {
  private eventManager_ = new EventManager();

  private mediaEventManager_: EventManager | null = null;

  state: State = {
    playhead: "idle",
    started: false,
    time: 0,
    duration: NaN,
    volume: 0,
    autoQuality: true,
    qualities: [],
    audioTracks: [],
    subtitleTracks: [],
  };

  private timeTick_ = new Timer(() => this.onTimeTick_());

  constructor(
    public hls: Hls,
    private emit_: StateObserverEmit,
  ) {
    const listen = this.eventManager_.listen(hls);

    listen(Hls.Events.MANIFEST_LOADED, this.onManifestLoaded_, this);
    listen(Hls.Events.BUFFER_CREATED, this.onBufferCreated_, this);
    listen(Hls.Events.LEVELS_UPDATED, this.onLevelsUpdated_, this);
    listen(Hls.Events.LEVEL_SWITCHING, this.onLevelSwitching_, this);
    listen(Hls.Events.MEDIA_ATTACHED, this.onMediaAttached_, this);
    listen(Hls.Events.MEDIA_DETACHED, this.onMediaDetached_, this);
    listen(
      Hls.Events.SUBTITLE_TRACKS_UPDATED,
      this.onSubtitleTracksUpdated_,
      this,
    );
    listen(Hls.Events.SUBTITLE_TRACK_SWITCH, this.onSubtitleTrackSwitch_, this);
    listen(Hls.Events.AUDIO_TRACKS_UPDATED, this.onAudioTracksUpdated_, this);
    listen(Hls.Events.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching_, this);

    if (hls.media) {
      // Looks like we already have media attached, bind listeners immediately.
      this.onMediaAttached_();
    }
  }

  private onManifestLoaded_() {
    this.onLevelsUpdated_();
  }

  private onBufferCreated_() {
    this.timeTick_.tickNow();
  }

  private onAudioTracksUpdated_() {
    const tracks = this.hls.allAudioTracks.map<AudioTrack>((track, index) => {
      let label = getLang(track.lang);
      if (track.channels === "6") {
        label += " 5.1";
      }
      return {
        id: index,
        active: this.isAudioTrackActive_(track),
        label,
        track,
      };
    });

    this.state.audioTracks = tracks;

    this.dispatchEvent_(Events.AUDIO_TRACKS_CHANGE, { audioTracks: tracks });
  }

  private isAudioTrackActive_(t: MediaPlaylist) {
    if (!this.hls.audioTracks.includes(t)) {
      return false;
    }
    return t.id === this.hls.audioTrack;
  }

  private isSubtitleTrackActive_(t: MediaPlaylist) {
    if (!this.hls.subtitleTracks.includes(t)) {
      return false;
    }
    return t.id === this.hls.subtitleTrack;
  }

  private onAudioTrackSwitching_() {
    const newTracks = updateActive(this.state.audioTracks, (t) =>
      this.isAudioTrackActive_(t.track),
    );

    if (newTracks === this.state.audioTracks) {
      return;
    }

    this.state.audioTracks = newTracks;

    this.dispatchEvent_(Events.AUDIO_TRACKS_CHANGE, {
      audioTracks: newTracks,
    });
  }

  private onSubtitleTracksUpdated_() {
    const tracks = this.hls.allSubtitleTracks.map<SubtitleTrack>(
      (track, index) => ({
        id: index,
        active: this.isSubtitleTrackActive_(track),
        label: getLang(track.lang),
        track,
      }),
    );

    this.state.subtitleTracks = tracks;

    this.dispatchEvent_(Events.SUBTITLE_TRACKS_CHANGE, {
      subtitleTracks: tracks,
    });
  }

  private onSubtitleTrackSwitch_() {
    const newTracks = updateActive(this.state.subtitleTracks, (t) =>
      this.isSubtitleTrackActive_(t.track),
    );

    if (newTracks === this.state.subtitleTracks) {
      return;
    }

    this.state.subtitleTracks = newTracks;

    this.dispatchEvent_(Events.SUBTITLE_TRACKS_CHANGE, {
      subtitleTracks: newTracks,
    });
  }

  setQuality(height: number | null) {
    if (height === null) {
      this.hls.nextLevel = -1;
    } else {
      const loadLevel = this.hls.levels[this.hls.loadLevel];
      assert(loadLevel, "No level found for loadLevel index");

      const idx = this.hls.levels.findIndex((level) => {
        return (
          level.height === height && level.audioCodec === loadLevel.audioCodec
        );
      });

      if (idx < 0) {
        throw new Error("Could not find matching level");
      }

      this.hls.nextLevel = idx;
      this.onLevelSwitching_();
    }

    const newAutoQuality = this.hls.autoLevelEnabled;
    if (newAutoQuality !== this.state.autoQuality) {
      this.state.autoQuality = newAutoQuality;
      this.dispatchEvent_(Events.AUTO_QUALITY_CHANGE, {
        autoQuality: newAutoQuality,
      });
    }
  }

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

  setAudioTrack(id: number) {
    const audioTrack = this.hls.allAudioTracks[id];
    this.hls.setAudioOption({
      lang: audioTrack.lang,
      channels: audioTrack.channels,
      name: audioTrack.name,
    });
  }

  destroy() {
    this.eventManager_.removeAll();

    this.mediaEventManager_?.removeAll();
    this.mediaEventManager_ = null;

    this.timeTick_.stop();
  }

  private onLevelsUpdated_() {
    const map: Record<string, Level[]> = {};
    for (const level of this.hls.levels) {
      if (!map[level.height]) {
        map[level.height] = [];
      }
      map[level.height].push(level);
    }

    const level = this.hls.levels[this.hls.nextLoadLevel];
    const mapEntries = Object.entries(map);
    const qualities = mapEntries.reduce<Quality[]>((acc, [key, levels]) => {
      acc.push({
        height: +key,
        active: +key === level?.height,
        levels,
      });
      return acc;
    }, []);

    qualities.sort((a, b) => b.height - a.height);

    this.state.qualities = qualities;
    this.dispatchEvent_(Events.QUALITIES_CHANGE, { qualities });
  }

  private onLevelSwitching_() {
    const level = this.hls.levels[this.hls.nextLoadLevel];

    const newQualities = updateActive(
      this.state.qualities,
      (q) => q.height === level.height,
    );

    if (newQualities === this.state.qualities) {
      return;
    }

    this.state.qualities = newQualities;
    this.dispatchEvent_(Events.QUALITIES_CHANGE, {
      qualities: this.state.qualities,
    });
  }

  private onMediaAttached_() {
    assert(this.hls.media);

    const media = this.hls.media;
    const state = this.state;

    // Set initial state when we have media attached.
    this.state.volume = media.volume;

    this.mediaEventManager_ = new EventManager();
    const listen = this.mediaEventManager_.listen(media);

    listen("play", () => this.setPlayhead_("play"));

    listen("playing", () => {
      this.timeTick_.tickNow().tickEvery(0.25);
      this.setPlayhead_("playing");
    });

    listen("pause", () => {
      this.timeTick_.tickNow();
      this.setPlayhead_("pause");
    });

    listen("volumechange", () => {
      state.volume = media.volume;
      this.dispatchEvent_(Events.VOLUME_CHANGE, { volume: media.volume });
    });

    listen("ended", () => this.setPlayhead_("ended"));
  }

  private onMediaDetached_() {
    this.timeTick_.stop();

    this.mediaEventManager_?.removeAll();
    this.mediaEventManager_ = null;
  }

  private onTimeTick_() {
    let time = 0;
    let duration = NaN;

    if (this.hls.media) {
      time = this.hls.media.currentTime;
      duration = this.hls.media.duration;
    }

    const oldTime = this.state.time;
    this.state.time = preciseFloat(time);

    const oldDuration = this.state.duration;
    this.state.duration = preciseFloat(duration);

    if (isNaN(duration)) {
      return;
    }

    if (oldTime === this.state.time && oldDuration === this.state.duration) {
      return;
    }

    this.dispatchEvent_(Events.TIME_CHANGE, {
      time: this.state.time,
      duration: this.state.duration,
    });
  }

  private setPlayhead_(playhead: Playhead) {
    this.state.playhead = playhead;

    if (playhead === "playing") {
      this.state.started = true;
    }

    this.dispatchEvent_(Events.PLAYHEAD_CHANGE, {
      playhead,
      started: this.state.started,
    });
  }

  private dispatchEvent_<E extends Events>(
    event: E,
    eventObj: Parameters<HlsFacadeListeners[E]>[0],
  ) {
    this.emit_(this.hls, event, eventObj);
  }

  requestTimeTick() {
    this.timeTick_.tickNow();
  }
}
