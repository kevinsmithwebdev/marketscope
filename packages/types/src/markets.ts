export type PricePoint = {
  date: string;
  close: number;
};

export type InstrumentGroup = "index" | "stock" | "etf" | "commodity" | "fx";

export type Instrument = {
  symbol: string;
  name: string;
  group: InstrumentGroup;
};

export type InstrumentCatalog = {
  instruments: Instrument[];
};

export type StockHistory = {
  symbol: string;
  source: "alpha-vantage";
  points: PricePoint[];
};

export type InstrumentQuote = {
  symbol: string;
  price: number;
  change: number | null;
  changePercent: string | null;
  source: "alpha-vantage";
};

export type MarketMover = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: string;
};

export type MarketMovers = {
  source: "alpha-vantage";
  updatedAt: string | null;
  gainers: MarketMover[];
  losers: MarketMover[];
};
