export type Session = {
  id: string;
  assetId: string;
  interstitials: Interstitial[];
};

export type Interstitial = {
  timeOffset: number;
  assetId: string;
};
