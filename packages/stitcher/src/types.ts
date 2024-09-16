export type Session = {
  id: string;
  assetId: string;
  interstitials?: Interstitial[];
  resolution?: string;
};

export type InterstitialType = "ad" | "bumper";

export type Interstitial = {
  timeOffset: number;
  assetId: string;
  type?: InterstitialType;
};
