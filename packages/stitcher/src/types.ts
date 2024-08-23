export type Session = {
  id: string;
  assetId: string;
  ads: Ad[];
};

export type Ad = {
  timeOffset: number;
  assetId: string;
};
