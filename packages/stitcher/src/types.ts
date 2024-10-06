import { VmapResponse } from "./vmap.js";

export type Session = {
  id: string;
  uri: string;
  interstitials?: Interstitial[];
  filter?: Filter;
  vmap?: Vmap;
  vmapResponse?: VmapResponse;
  programDateTime?: string;
};

export type InterstitialType = "ad" | "bumper";

export type Interstitial = {
  timeOffset: number;
  uri: string;
  type?: InterstitialType;
};

export type Filter = {
  resolution?: string;
};

export type Vmap = {
  url: string;
};
