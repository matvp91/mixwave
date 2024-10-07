import type { DateTime } from "luxon";
import type { VmapResponse } from "./vmap";

export type Session = {
  id: string;
  uri: string;
  startDate: DateTime;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
  vmapResponse?: VmapResponse;
};

export type SessionInterstitialType = "ad" | "bumper";

export type SessionInterstitial = {
  timeOffset: number;
  uri: string;
  type?: SessionInterstitialType;
};

export type SessionFilter = {
  resolution?: string;
};

export type SessionVmap = {
  url: string;
};
