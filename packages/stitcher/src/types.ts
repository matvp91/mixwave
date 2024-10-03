export type Session = {
  id: string;
  uri: string;
  interstitials?: Interstitial[];
  filter?: Filter;
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
