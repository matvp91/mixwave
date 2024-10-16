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
  label: string;
};

/**
 * Defines an audio track.
 */
export type AudioTrack = {
  id: number;
  active: boolean;
  label: string;
};

/**
 * Defines a quality level.
 */
export type Quality = {
  height: number;
  active: boolean;
};

export type Events = {
  "*": () => void;
};

export type PlayheadState = "idle" | "play" | "pause" | "ended";
