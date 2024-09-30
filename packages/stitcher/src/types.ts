export type Session = {
  id: string;
  uri: string;
  interstitials?: Interstitial[];
  resolution?: string;
};

export type InterstitialType = "ad" | "bumper";

export type Interstitial = {
  timeOffset: number;
  uri: string;
  type?: InterstitialType;
};
