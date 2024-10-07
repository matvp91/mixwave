import type { MediaPlaylist, Level } from "hls.js";

export type Anything = any;

export type MixType = "ad" | "bumper";

export type Slot = {
  type?: "ad" | "bumper";
  time: number;
  duration: number;
};

export type SubtitleTrack = {
  id: number;
  active: boolean;
  playlist: MediaPlaylist;
};

export type AudioTrack = {
  id: number;
  active: boolean;
  playlist: MediaPlaylist;
};

export type Quality = {
  id: number;
  active: boolean;
  level: Level;
};

export type State = {
  isStarted: boolean;
  playheadState: "idle" | "play" | "pause" | "ended";
  time: number;
  duration: number;
  cuePoints: number[];
  autoQuality: boolean;
  qualities: Quality[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  slot: Slot | null;
  volume: number;
};

export type Events = {
  "*": () => void;
};
