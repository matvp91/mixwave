export type Session = {
  id: string;
  url: string;
  ads: Ad[];
};

export type Ad = {
  offset: number;
  assetId: string;
};
