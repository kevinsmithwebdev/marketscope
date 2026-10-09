export const API_BASE_URL = "http://localhost:4000";

export const HISTORY_STALE_TIME_MS = 15 * 60 * 1000;

export type PricePoint = {
  date: string;
  close: number;
};

export type StockHistory = {
  symbol: string;
  source: "alpha-vantage";
  points: PricePoint[];
};

export async function fetchStockHistory(symbol: string): Promise<StockHistory> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/markets/stocks/${symbol}/history`);
  } catch {
    throw new Error("MarketScope API is unavailable");
  }

  if (!response.ok) {
    throw new Error("Market data is unavailable");
  }

  const history = (await response.json()) as StockHistory;
  if (history.source !== "alpha-vantage" || !Array.isArray(history.points)) {
    throw new Error("Market data is unavailable");
  }

  return history;
}
