import type { CryptoHistory, StockHistory } from "@marketscope/types";

const API_BASE_URL = "http://localhost:4000";

export const WATCHLIST_STALE_TIME_MS = 15 * 60 * 1000;

export async function fetchEquityHistory(symbol: string): Promise<StockHistory> {
  return readHistory<StockHistory>(`/api/markets/stocks/${encodeURIComponent(symbol)}/history`);
}

export async function fetchCryptoHistory(id: string): Promise<CryptoHistory> {
  return readHistory<CryptoHistory>(`/api/crypto/${encodeURIComponent(id)}/history`);
}

async function readHistory<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new Error("MarketScope API is unavailable");
  }

  if (!response.ok) {
    throw new Error("History is unavailable");
  }

  return (await response.json()) as T;
}
