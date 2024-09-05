import Hls from "hls.js";
import update from "immutability-helper";
import EventEmitter from "eventemitter3";
import type { Spec } from "immutability-helper";

export { Controls as HlsControls } from "./Controls";

export type HlsInterstitial = {
  seekAllowed: boolean;
};

export type HlsQuality = {
  id: number;
  height: number;
  active: boolean;
};

export type HlsSubtitleTrack = {
  id: number;
  name: string;
  active: boolean;
};

export type HlsAudioTrack = {
  id: number;
  name: string;
  active: boolean;
};

export type HlsSeekRange = {
  start: number;
  end: number;
};

export type HlsState = {
  playheadState: "idle" | "play" | "pause";
  time: number;
  seekRange: HlsSeekRange;
  interstitial: HlsInterstitial | null;
  cuePoints: number[];
  qualities: HlsQuality[];
  subtitleTracks: HlsSubtitleTrack[];
  audioTracks: HlsAudioTrack[];
};

export type HlsFacadeEvent = {
  "*": () => void;
};

export class HlsFacade extends EventEmitter<HlsFacadeEvent> {
  private intervalId_: number | undefined;

  constructor(public hls: Hls) {
    super();

    hls.once(Hls.Events.BUFFER_CREATED, () => {
      this.syncState_();
    });

    hls.on(Hls.Events.LEVEL_SWITCHING, () => {
      this.syncQualities_();
    });

    hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, () => {
      this.syncAudioTracks_();
    });

    hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
      this.syncSubtitleTracks_();
    });

    hls.on(Hls.Events.INTERSTITIAL_ASSET_PLAYER_CREATED, (_, data) => {
      data.player.once(Hls.Events.BUFFER_CREATED, () => {
        this.syncState_();
      });
    });

    hls.on(Hls.Events.INTERSTITIAL_STARTED, (_, data) => {
      const interstitial: HlsInterstitial = {
        seekAllowed: !data.event.restrictions.skip,
      };
      this.setState_({
        interstitial: {
          $set: interstitial,
        },
      });
    });

    hls.on(Hls.Events.INTERSTITIAL_ENDED, () => {
      this.setState_({ interstitial: { $set: null } });
    });

    hls.on(Hls.Events.INTERSTITIALS_UPDATED, (_, data) => {
      this.setState_({
        cuePoints: {
          $set: data.schedule.reduce<number[]>((acc, item) => {
            if (!acc.includes(item.start)) {
              acc.push(item.start);
            }
            return acc;
          }, []),
        },
      });
    });
  }

  destroy() {
    clearInterval(this.intervalId_);
  }

  state: HlsState = {
    playheadState: "idle",
    time: 0,
    seekRange: { start: 0, end: 0 },
    interstitial: null,
    cuePoints: [],
    qualities: [],
    subtitleTracks: [],
    audioTracks: [],
  };

  private onTick_() {
    const { integrated } = this.getInterstitialsManager_();

    this.setState_({
      time: { $set: integrated.currentTime },
      seekRange: { $set: { start: 0, end: integrated.duration } },
    });
  }

  playOrPause() {
    const media = this.getMedia_();
    const { playheadState } = this.state;

    const shouldPause = playheadState === "play";
    if (shouldPause) {
      media.pause();
    } else {
      if (playheadState === "idle") {
        media.autoplay = true;
      }
      media.play();
    }

    this.setState_({
      playheadState: { $set: shouldPause ? "pause" : "play" },
    });
  }

  seekTo(targetTime: number) {
    this.getInterstitialsManager_().integrated.seekTo(targetTime);
  }

  setQuality(id: number | null) {
    if (id) {
      this.hls.nextLevel = id - 1;
    } else {
      this.hls.nextLevel = -1;
    }
  }

  setSubtitleTrack(id: number | null) {
    if (id) {
      this.hls.subtitleTrack = id - 1;
    } else {
      this.hls.subtitleTrack = -1;
    }
  }

  setAudioTrack(id: number | null) {
    if (id) {
      this.hls.audioTrack = id - 1;
    } else {
      this.hls.audioTrack = -1;
    }
  }

  private setState_(spec: Spec<HlsState>) {
    const nextState = update(this.state, spec);
    if (nextState !== this.state) {
      this.state = nextState;
    }
    this.emit("*");
  }

  private getInterstitialsManager_() {
    const { interstitialsManager } = this.hls;
    if (!interstitialsManager) {
      throw new HlsFacadeNoInterstitialsManager();
    }
    return interstitialsManager;
  }

  private getMedia_() {
    const manager = this.getInterstitialsManager_();
    const media = manager.bufferingPlayer?.media ?? this.hls.media;
    if (!media) {
      throw new HlsFacadeNoMedia();
    }
    return media;
  }

  private syncState_() {
    clearInterval(this.intervalId_);
    this.intervalId_ = setInterval(() => this.onTick_(), 500);
    this.onTick_();
  }

  private syncQualities_() {
    const qualities = this.hls.levels.map<HlsQuality>((level, index) => ({
      id: index + 1,
      height: level.height ?? 0,
      active: index === this.hls.nextLoadLevel,
    }));

    qualities.sort((a, b) => b.height - a.height);

    this.setState_({
      qualities: { $set: qualities },
    });
  }

  private syncAudioTracks_() {
    const audioTracks = this.hls.audioTracks.map<HlsAudioTrack>(
      (audioTrack, index) => ({
        id: index + 1,
        name: audioTrack.name,
        active: index === this.hls.audioTrack,
      }),
    );

    this.setState_({
      audioTracks: { $set: audioTracks },
    });
  }

  private syncSubtitleTracks_() {
    const subtitleTracks = this.hls.subtitleTracks.map<HlsSubtitleTrack>(
      (subtitleTrack, index) => ({
        id: index + 1,
        name: subtitleTrack.name,
        active: index === this.hls.subtitleTrack,
      }),
    );

    this.setState_({
      subtitleTracks: { $set: subtitleTracks },
    });
  }
}

export class HlsFacadeNoMedia extends Error {
  constructor() {
    super("No available media found");
  }
}

export class HlsFacadeNoInterstitialsManager extends Error {
  constructor() {
    super("No interstitials manager found");
  }
}
