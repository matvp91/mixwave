import type { Level, MediaPlaylist } from "hls.js";

/**
 * A custom type for each `ASSET`.
 */
export type InterstitialType = "ad" | "bumper";

/**
 * Defines an in-band subtitle track.
 */
export type SubtitleTrack = {
  id: number;
  active: boolean;
  label: string;
  track: MediaPlaylist;
};

/**
 * Defines an audio track.
 */
export type AudioTrack = {
  id: number;
  active: boolean;
  label: string;
  track: MediaPlaylist;
};

/**
 * Defines a quality level.
 */
export type Quality = {
  height: number;
  active: boolean;
  levels: Level[];
};

/**
 * State of playhead across all interstitials.
 */
export type PlayheadState = "idle" | "play" | "playing" | "pause" | "ended";

export type Interstitial = {
  type?: InterstitialType;
  time: number;
  duration: number;
};

export type State = {
  playheadState: PlayheadState;
  started: boolean;
  time: number;
  duration: number;
  volume: number;
  interstitial?: Interstitial;
  autoQuality: boolean;
  qualities: Quality[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  cuePoints: number[];
};

export type Events = {
  "*": () => void;
};
