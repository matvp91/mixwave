import { VmapResponse } from "./vmap.js";

export type Session = {
  id: string;
  uri: string;
  interstitials?: SessionInterstitial[];
  filter?: SessionFilter;
  vmap?: SessionVmap;
  vmapResponse?: VmapResponse;
  programDateTime?: string;
};

export type SessionInterstitial = {
  timeOffset: number;
  uri: string;
  type?: "ad" | "bumper";
};

export type SessionFilter = {
  resolution?: string;
};

export type SessionVmap = {
  url: string;
};

export type InterstitialAsset = {
  URI: string;
  DURATION: number;
  "MIX-TYPE": Required<SessionInterstitial["type"]>;
};
