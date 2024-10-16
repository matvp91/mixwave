import type {
  AudioTrack,
  PlayheadState,
  Quality,
  Slot,
  SubtitleTrack,
} from "../..";

export type Metadata = {
  title?: string;
  subtitle?: string;
};

export type State = {
  loaded: boolean;
  playheadState: PlayheadState;
  started: boolean;
  time: number;
  duration: number;
  volume: number;
  slot: Slot | null;
  autoQuality: boolean;
  qualities: Quality[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  cuePoints: number[];
};
