export type Session = {
  id: string;
  assetId: string;
  interstitials: Interstitial[];
  maxResolution: number;
};

export type Interstitial = {
  timeOffset: number;
  assetId: string;
};
