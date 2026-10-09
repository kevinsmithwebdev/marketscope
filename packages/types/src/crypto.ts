import type { PricePoint } from "./markets";

export type CryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  changePercent24h: number | null;
  rank: number | null;
};

export type CryptoAssetList = {
  source: "coingecko";
  assets: CryptoAsset[];
};

export type CryptoHistory = {
  id: string;
  source: "coingecko";
  points: PricePoint[];
};
