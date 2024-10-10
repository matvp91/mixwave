import type { MediaPlaylist, Level } from "@mixwave/hls.js";

/**
 * A custom type for each `ASSET`.
 */
export type MixType = "ad" | "bumper";

/**
 * Anything that is not the primary content is a slot,
 * they map 1 to 1 on interstitials in the HLS playlist.
 */
export type Slot = {
  type?: MixType;
  time: number;
  duration: number;
};

/**
 * Defines an in-band subtitle track.
 */
export type SubtitleTrack = {
  id: number;
  active: boolean;
  /**
   * The playlist defined in HLS.js
   */
  playlist: MediaPlaylist;
};

/**
 * Defines an audio track.
 */
export type AudioTrack = {
  id: number;
  active: boolean;
  /**
   * The playlist defined in HLS.js
   */
  playlist: MediaPlaylist;
};

/**
 * Defines a quality level.
 */
export type Quality = {
  id: number;
  active: boolean;
  /**
   * The level defined in HLS.js
   */
  level: Level;
};

/**
 * Player session state.
 * This is immutable, each state update is a new reference. Can be easily consumed by
 * reactive libraries such as React.
 */
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
  /**
   * When null, the player plays the primary content.
   */
  slot: Slot | null;
  volume: number;
};

export type Events = {
  "*": () => void;
};
