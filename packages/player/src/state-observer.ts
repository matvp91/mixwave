import Hls from "hls.js";
import { EventManager } from "./event-manager";
import { updateActive, preciseFloat, getLang } from "./helpers";
import { assert } from "./assert";
import { Tick } from "./tick";
import type { Quality, State, SubtitleTrack } from "./types";
import type { Level } from "hls.js";

export class StateObserver {
  private eventManager_ = new EventManager();

  private mediaEventManager_: EventManager | null = null;

  private state_: State = {
    playheadState: "idle",
    started: false,
    time: 0,
    duration: NaN,
    volume: 0,
    autoQuality: false,
    qualities: [],
    audioTracks: [],
    subtitleTracks: [],
    cuePoints: [],
  };

  private timeTick_ = new Tick(250, () => {
    this.onTimeTick_();
  });

  constructor(private hls_: Hls) {
    const listen = this.eventManager_.listen(hls_);

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

    this.state_.subtitleTracks = tracks;

    this.updateActiveSubtitleTrack_(tracks);
  }

  private onSubtitleTrackSwitch_() {
    this.updateActiveSubtitleTrack_();
  }

  private updateActiveSubtitleTrack_(newTracks?: SubtitleTrack[]) {
    const tracks = newTracks ?? this.state_.subtitleTracks;

    this.state_.subtitleTracks = updateActive(
      tracks,
      (t) =>
        t.track.id === this.hls_.subtitleTrack &&
        this.hls_.subtitleTracks.includes(t.track),
    );
  }

  setQuality(height: number | null) {
    if (height === null) {
      this.hls_.nextLevel = -1;
      this.updateActiveQuality_();
    } else {
      const loadLevel = this.hls_.levels[this.hls_.loadLevel];
      assert(loadLevel);

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

  private onBufferCreated_() {
    this.onLevelsUpdated_();
    this.onSubtitleTracksUpdated_();

    this.timeTick_.tick();
  }

  private onLevelsUpdated_() {
    const map: Record<string, Level[]> = {};
    for (const level of this.hls_.levels) {
      if (!map[level.height]) {
        map[level.height] = [];
      }
      map[level.height].push(level);
    }

    const qualities = Object.entries(map).reduce<Quality[]>(
      (acc, [key, levels]) => {
        acc.push({
          height: +key,
          active: false,
          levels,
        });
        return acc;
      },
      [],
    );

    qualities.sort((a, b) => b.height - a.height);
    this.state_.qualities = qualities;

    this.updateActiveQuality_(qualities);
  }

  private onLevelSwitching_() {
    this.updateActiveQuality_();
  }

  private onMediaAttached_() {
    assert(this.hls_.media);

    const { media } = this.hls_;

    // Set initial state when we have media attached.
    this.state_.volume = media.volume;

    this.mediaEventManager_ = new EventManager();
    const listen = this.mediaEventManager_.listen(media);

    listen("play", () => {
      this.state_.playheadState = "play";
    });

    listen("playing", () => {
      this.state_.playheadState = "playing";
      this.state_.started = true;
    });

    listen("pause", () => {
      this.state_.playheadState = "pause";
      this.timeTick_.tick();
    });

    listen("volumechange", () => {
      this.state_.volume = media.volume;
    });

    listen("ended", () => {
      this.state_.playheadState = "ended";
    });
  }

  private onMediaDetached_() {
    this.timeTick_.stop();

    this.mediaEventManager_?.removeAll();
    this.mediaEventManager_ = null;
  }

  private updateActiveQuality_(newQualities?: Quality[]) {
    this.state_.autoQuality = this.hls_.autoLevelEnabled;

    const level = this.hls_.levels[this.hls_.nextLoadLevel];

    const qualities = newQualities ?? this.state_.qualities;

    this.state_.qualities = updateActive(
      qualities,
      (q) => q.height === level.height,
    );
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

    this.state_.time = preciseFloat(time);
    this.state_.duration = preciseFloat(duration);
  }

  private onInterstitialsUpdated_() {
    // The interstitialsManager is available now, tick time to force
    // a sync with the primary.
    this.timeTick_.tick();
  }
}
