import Hls from "hls.js";
import { EventManager } from "./event-manager";
import { updateActive, preciseFloat, getLang } from "./helpers";
import { assert } from "./assert";
import { Timer } from "./timer";
import {
  Events,
  type AudioTrack,
  type FacadeListeners,
  type Quality,
  type State,
  type SubtitleTrack,
} from "./types";
import type { Level } from "hls.js";
import type { Facade, Playhead } from ".";
import type { MediaPlaylist } from "hls.js";

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
    private hls_: Hls,
    private facade_: Facade,
  ) {
    const listen = this.eventManager_.listen(hls_);

    listen(Hls.Events.MANIFEST_LOADED, this.onManifestLoaded_, this);
    listen(Hls.Events.BUFFER_CREATED, this.onBufferCreated_, this);
    listen(Hls.Events.LEVELS_UPDATED, this.onLevelsUpdated_, this);
    listen(Hls.Events.LEVEL_SWITCHING, this.onLevelSwitching_, this);
    listen(Hls.Events.MEDIA_ATTACHED, this.onMediaAttached_, this);
    listen(Hls.Events.MEDIA_DETACHED, this.onMediaDetached_, this);
    listen(
      Hls.Events.INTERSTITIALS_UPDATED,
      this.onInterstitialsUpdated_,
      this,
    );
    listen(
      Hls.Events.SUBTITLE_TRACKS_UPDATED,
      this.onSubtitleTracksUpdated_,
      this,
    );
    listen(Hls.Events.SUBTITLE_TRACK_SWITCH, this.onSubtitleTrackSwitch_, this);
    listen(Hls.Events.AUDIO_TRACKS_UPDATED, this.onAudioTracksUpdated_, this);
    listen(Hls.Events.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching_, this);
  }

  private onAudioTracksUpdated_() {
    const tracks = this.hls_.allAudioTracks.map<AudioTrack>((track, index) => {
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
    this.emit_(Events.AUDIO_TRACKS_CHANGE, { audioTracks: tracks });
  }

  private isAudioTrackActive_(t: MediaPlaylist) {
    if (!this.hls_.audioTracks.includes(t)) {
      return false;
    }
    return t.id === this.hls_.audioTrack;
  }

  private onAudioTrackSwitching_() {
    const newTracks = updateActive(this.state.audioTracks, (t) =>
      this.isAudioTrackActive_(t.track),
    );

    if (newTracks === this.state.audioTracks) {
      return;
    }

    this.state.audioTracks = newTracks;

    this.emit_(Events.AUDIO_TRACKS_CHANGE, {
      audioTracks: newTracks,
    });
  }

  private onSubtitleTracksUpdated_() {
    const tracks = this.hls_.allSubtitleTracks.map<SubtitleTrack>(
      (track, index) => ({
        id: index,
        active: false,
        label: getLang(track.lang),
        track,
      }),
    );

    this.state.subtitleTracks = tracks;

    this.updateActiveSubtitleTrack_();
  }

  private onSubtitleTrackSwitch_() {
    this.updateActiveSubtitleTrack_();
  }

  private updateActiveSubtitleTrack_() {
    const oldSubtitleTracks = this.state.subtitleTracks;
    this.state.subtitleTracks = updateActive(
      this.state.subtitleTracks,
      (t) =>
        t.track.id === this.hls_.subtitleTrack &&
        this.hls_.subtitleTracks.includes(t.track),
    );

    const fireEmit = oldSubtitleTracks !== this.state.subtitleTracks;
    if (fireEmit) {
      this.emit_(Events.SUBTITLE_TRACKS_CHANGE, {
        subtitleTracks: this.state.subtitleTracks,
      });
    }
  }

  setQuality(height: number | null) {
    if (height === null) {
      this.hls_.nextLevel = -1;
      this.updateActiveQuality_();
    } else {
      const loadLevel = this.hls_.levels[this.hls_.loadLevel];
      assert(loadLevel, "No level found for loadLevel index");

      const idx = this.hls_.levels.findIndex((level) => {
        return level.height === height && level.codecSet === loadLevel.codecSet;
      });

      this.hls_.nextLevel = idx;
      this.updateActiveQuality_();
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

  destroy() {
    this.eventManager_.removeAll();

    this.mediaEventManager_?.removeAll();
    this.mediaEventManager_ = null;

    this.timeTick_.stop();
  }

  private onManifestLoaded_() {
    this.initState_();
  }

  private onBufferCreated_() {
    this.initState_();
  }

  private initState_() {
    this.onLevelsUpdated_();
    this.onSubtitleTracksUpdated_();
    this.onAudioTracksUpdated_();

    this.timeTick_.tickNow();
  }

  private onLevelsUpdated_() {
    const map: Record<string, Level[]> = {};
    for (const level of this.hls_.levels) {
      if (!map[level.height]) {
        map[level.height] = [];
      }
      map[level.height].push(level);
    }

    const mapEntries = Object.entries(map);
    const qualities = mapEntries.reduce<Quality[]>((acc, [key, levels]) => {
      acc.push({
        height: +key,
        active: false,
        levels,
      });
      return acc;
    }, []);

    qualities.sort((a, b) => b.height - a.height);

    this.state.qualities = qualities;

    this.updateActiveQuality_();
  }

  private onLevelSwitching_() {
    this.updateActiveQuality_();
  }

  private onMediaAttached_() {
    assert(this.hls_.media);

    const media = this.hls_.media;
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
      this.emit_(Events.VOLUME_CHANGE, { volume: media.volume });
    });

    listen("ended", () => this.setPlayhead_("ended"));
  }

  private onMediaDetached_() {
    this.timeTick_.stop();

    this.mediaEventManager_?.removeAll();
    this.mediaEventManager_ = null;
  }

  private updateActiveQuality_() {
    const oldAutoQuality = this.state.autoQuality;
    this.state.autoQuality = this.hls_.autoLevelEnabled;

    const level = this.hls_.levels[this.hls_.nextLoadLevel];

    const oldQualities = this.state.qualities;
    this.state.qualities = updateActive(
      this.state.qualities,
      (q) => q.height === level.height,
    );

    const fireEmit =
      oldAutoQuality !== this.state.autoQuality ||
      oldQualities !== this.state.qualities;

    if (fireEmit) {
      this.emit_(Events.QUALITIES_CHANGE, {
        qualities: this.state.qualities,
      });
    }
  }

  private onTimeTick_() {
    let time = 0;
    let duration = NaN;

    if (this.hls_.media) {
      time = this.hls_.media.currentTime;
      duration = this.hls_.media.duration;
    }

    const mgr = this.hls_.interstitialsManager;
    if (mgr) {
      time = mgr.primary.currentTime;
      duration = mgr.primary.duration;
    }

    const oldTime = this.state.time;
    this.state.time = preciseFloat(time);

    const oldDuration = this.state.duration;
    this.state.duration = preciseFloat(duration);

    if (oldTime !== this.state.time || oldDuration !== this.state.duration) {
      this.emit_(Events.TIME_CHANGE, {
        time: this.state.time,
        duration: this.state.duration,
      });
    }
  }

  private setPlayhead_(playhead: Playhead) {
    this.state.playhead = playhead;

    if (playhead === "playing") {
      this.state.started = true;
    }

    this.emit_(Events.PLAYHEAD_CHANGE, { playhead });
  }

  private onInterstitialsUpdated_() {
    // The interstitialsManager is available now, tick time to force a sync with the primary.
    this.timeTick_.tickNow();
  }

  private emit_<E extends Events>(
    event: E,
    eventObj: Parameters<FacadeListeners[E]>[0],
  ) {
    this.facade_.emit(event, eventObj);
    this.facade_.emit("*", event);
  }
}
