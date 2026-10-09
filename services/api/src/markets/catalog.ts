export type InstrumentGroup = "index" | "stock" | "etf" | "commodity" | "fx";

export type CatalogInstrument = {
  symbol: string;
  name: string;
  group: InstrumentGroup;
};

export const MARKET_CATALOG: CatalogInstrument[] = [
  { symbol: "SPY", name: "S&P 500 tracker", group: "index" },
  { symbol: "QQQ", name: "Nasdaq-100 tracker", group: "index" },
  { symbol: "DIA", name: "Dow Jones tracker", group: "index" },
  { symbol: "IWM", name: "Russell 2000 tracker", group: "index" },
  { symbol: "AAPL", name: "Apple", group: "stock" },
  { symbol: "MSFT", name: "Microsoft", group: "stock" },
  { symbol: "NVDA", name: "NVIDIA", group: "stock" },
  { symbol: "AMZN", name: "Amazon", group: "stock" },
  { symbol: "VTI", name: "Total US stock market", group: "etf" },
  { symbol: "VEA", name: "Developed markets", group: "etf" },
  { symbol: "BND", name: "Total bond market", group: "etf" },
  { symbol: "GLD", name: "Gold", group: "commodity" },
  { symbol: "SLV", name: "Silver", group: "commodity" },
  { symbol: "USO", name: "Crude oil", group: "commodity" },
  { symbol: "EURUSD", name: "Euro / US dollar", group: "fx" },
  { symbol: "GBPUSD", name: "British pound / US dollar", group: "fx" },
  { symbol: "USDJPY", name: "US dollar / Japanese yen", group: "fx" },
];

export function findInstrument(symbol: string): CatalogInstrument | undefined {
  const normalized = symbol.trim().toUpperCase();
  return MARKET_CATALOG.find((instrument) => instrument.symbol === normalized);
}
