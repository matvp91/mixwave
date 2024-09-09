import Hls from "hls.js";
import type {
  InterstitialsManager,
  InterstitialScheduleItem,
  Level,
  MediaPlaylist,
} from "hls.js";

export type HlsStateSubtitleTrack = {
  id: number;
  active: boolean;
  playlist: MediaPlaylist;
};

export type HlsStateAudioTrack = {
  id: number;
  active: boolean;
  playlist: MediaPlaylist;
};

export type HlsStateQuality = {
  id: number;
  active: boolean;
  level: Level;
};

export type HlsState = {
  playheadState: "idle" | "play" | "pause" | "ended";
  time: number;
  duration: number;
  cuePoints: number[];
  autoQuality: boolean;
  qualities: HlsStateQuality[];
  audioTracks: HlsStateAudioTrack[];
  subtitleTracks: HlsStateSubtitleTrack[];
};

export class Session {
  state: HlsState;

  private interstitialsManager_: InterstitialsManager;

  constructor(private hls_: Hls) {
    if (!hls_.interstitialsManager) {
      throw new Error("Missing hls.interstitialsManager");
    }

    this.interstitialsManager_ = hls_.interstitialsManager;

    const cuePoints = this.interstitialsManager_.schedule.reduce<number[]>(
      (acc, item) => {
        const types = getMixTypes(item);
        if (types?.ad && !acc.includes(item.start)) {
          acc.push(item.start);
        }
        return acc;
      },
      [],
    );

    const qualities = hls_.levels.map<HlsStateQuality>((level, index) => ({
      id: index + 1,
      active: index === hls_.nextLoadLevel,
      level,
    }));

    qualities.sort((a, b) => b.level.height - a.level.height);

    const audioTracks = hls_.audioTracks.map<HlsStateAudioTrack>(
      (audioTrack, index) => ({
        id: index + 1,
        active: index === hls_.audioTrack,
        playlist: audioTrack,
      }),
    );

    const subtitleTracks = hls_.subtitleTracks.map<HlsStateSubtitleTrack>(
      (subtitleTrack, index) => ({
        id: index + 1,
        active: index === hls_.subtitleTrack,
        playlist: subtitleTrack,
      }),
    );

    this.state = {
      playheadState: "idle",
      time: preciseFloat(this.interstitialsManager_.integrated.currentTime),
      duration: preciseFloat(this.interstitialsManager_.integrated.duration),
      cuePoints,
      autoQuality: hls_.autoLevelEnabled,
      qualities,
      audioTracks,
      subtitleTracks,
    };
  }

  dispose() {}

  playOrPause() {
    const { playheadState } = this.state;

    const shouldPause = playheadState === "play";
    if (shouldPause) {
      this.media_.pause();
    } else {
      if (playheadState === "idle") {
        this.media_.autoplay = true;
      }
      this.media_.play();
    }
  }

  private get media_() {
    const media =
      this.interstitialsManager_.bufferingPlayer?.media ?? this.hls_.media;
    if (!media) {
      throw new Error("No media element found");
    }
    return media;
  }
}

export function createFacade(hls: Hls) {
  let session: Session | null = null;

  hls.on(Hls.Events.BUFFER_RESET, () => {
    session?.dispose();
    session = null;
  });

  hls.on(Hls.Events.INTERSTITIALS_UPDATED, () => {
    session = new Session(hls);
  });

  return {
    get session_() {
      return session;
    },
  };
}

function getMixTypes(item: InterstitialScheduleItem) {
  return item.event?.dateRange.attr.enumeratedStringList("X-MIX-TYPES", {
    ad: false,
  });
}

function preciseFloat(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
