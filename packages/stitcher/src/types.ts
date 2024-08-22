export type Session = {
  url: string;
  ads: Ad[];
};

export type Ad = {
  offset: number;
  assetId: string;
};
