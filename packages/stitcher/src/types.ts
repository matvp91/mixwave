export type Session = {
  id: string;
  url: string;
  ads: Ad[];
};

export type Ad = {
  timeOffset: number;
  assetId: string;
};
