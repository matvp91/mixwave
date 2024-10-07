import type { DateTime } from "luxon";

export type Resolution = {
  width: number;
  height: number;
};

export type RenditionType = "AUDIO" | "SUBTITLES";

export type Rendition = {
  type: RenditionType;
  groupId: string;
  name: string;
  uri?: string;
};

export type Variant = {
  uri: string;
  bandwidth: number;
  resolution?: Resolution;
  audio: Rendition[];
  subtitles: Rendition[];
};

export type MasterPlaylist = {
  isMasterPlaylist: true;
  independentSegments?: boolean;
  variants: Variant[];
};

export type MediaInitializationSection = {
  uri: string;
};

export type Segment = {
  uri: string;
  duration: number;
  discontinuity?: boolean;
  map?: MediaInitializationSection;
  programDateTime?: DateTime;
};

export type PlaylistType = "EVENT" | "VOD";

export type MediaPlaylist = {
  isMasterPlaylist: false;
  independentSegments?: boolean;
  targetDuration: number;
  endlist?: boolean;
  playlistType?: PlaylistType;
  segments: Segment[];
  mediaSequenceBase?: number;
  discontinuitySequenceBase?: number;
  dateRanges?: DateRange[];
};

export type DateRange = {
  id: string;
  classId: string;
  startDate: DateTime;
  clientAttributes?: Record<string, string | number>;
};
