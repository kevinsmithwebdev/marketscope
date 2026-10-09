import type { InstrumentCatalog, InstrumentQuote, MarketMovers, StockHistory } from "@marketscope/types";

export const API_BASE_URL = "http://localhost:4000";

export const HISTORY_STALE_TIME_MS = 15 * 60 * 1000;

export async function fetchCatalog(): Promise<InstrumentCatalog> {
  return readJson<InstrumentCatalog>(`${API_BASE_URL}/api/markets/catalog`);
}

export async function fetchMovers(): Promise<MarketMovers> {
  const movers = await readJson<MarketMovers>(`${API_BASE_URL}/api/markets/movers`);
  if (movers.source !== "alpha-vantage" || !Array.isArray(movers.gainers) || !Array.isArray(movers.losers)) {
    throw new Error("Market data is unavailable");
  }
  return movers;
}

export async function fetchQuote(symbol: string): Promise<InstrumentQuote> {
  const quote = await readJson<InstrumentQuote>(
    `${API_BASE_URL}/api/markets/stocks/${encodeURIComponent(symbol)}/quote`,
  );
  if (quote.source !== "alpha-vantage" || !Number.isFinite(quote.price)) {
    throw new Error("Market data is unavailable");
  }
  return quote;
}

export async function fetchStockHistory(symbol: string): Promise<StockHistory> {
  const history = await readJson<StockHistory>(
    `${API_BASE_URL}/api/markets/stocks/${encodeURIComponent(symbol)}/history`,
  );
  if (history.source !== "alpha-vantage" || !Array.isArray(history.points)) {
    throw new Error("Market data is unavailable");
  }
  return history;
}

async function readJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("MarketScope API is unavailable");
  }

  if (!response.ok) {
    throw new Error("Market data is unavailable");
  }

  return (await response.json()) as T;
}
