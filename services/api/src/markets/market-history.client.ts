import type { InstrumentGroup } from "./catalog";
import { normalizeDailySeries, type StockHistory } from "./normalize-daily-series";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,10}$/;
const DEFAULT_TTL_MS = 15 * 60 * 1000;

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message.replace(/apikey=[^&\s]+/gi, "apikey=redacted");
}

export class InvalidSymbolError extends Error {}
export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

export class MarketHistoryClient {
  private readonly cache = new Map<string, { expiresAt: number; value: StockHistory }>();
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly ttlMs: number;

  constructor(
    private readonly options: {
      apiKey: string | undefined;
      fetchImpl?: typeof fetch;
      now?: () => number;
      ttlMs?: number;
    },
  ) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.now = options.now ?? Date.now;
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  }

  async getDailyHistory(
    rawSymbol: string,
    group?: InstrumentGroup,
  ): Promise<{
    data: StockHistory;
    cacheStatus: "HIT" | "MISS";
  }> {
    const symbol = rawSymbol.trim().toUpperCase();
    if (!SYMBOL_PATTERN.test(symbol)) {
      throw new InvalidSymbolError();
    }

    const cached = this.cache.get(symbol);
    if (cached && cached.expiresAt > this.now()) {
      return { data: cached.value, cacheStatus: "HIT" };
    }

    const apiKey = this.options.apiKey?.trim();
    if (!apiKey) {
      throw new ProviderNotConfiguredError();
    }

    const fx = group === "fx";
    if (fx && !/^[A-Z]{6}$/.test(symbol)) {
      throw new InvalidSymbolError();
    }

    console.info(`Fetching ${symbol} daily history from Alpha Vantage`);

    const url = new URL("https://www.alphavantage.co/query");
    if (fx) {
      url.searchParams.set("function", "FX_DAILY");
      url.searchParams.set("from_symbol", symbol.slice(0, 3));
      url.searchParams.set("to_symbol", symbol.slice(3));
    } else {
      url.searchParams.set("function", "TIME_SERIES_DAILY");
      url.searchParams.set("symbol", symbol);
    }
    url.searchParams.set("outputsize", "compact");
    url.searchParams.set("apikey", apiKey);

    let payload: unknown;
    try {
      const response = await this.fetchImpl(url);
      if (!response.ok) {
        throw new ProviderRequestError();
      }
      payload = await response.json();
    } catch (error) {
      console.error(`Alpha Vantage request failed: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    let data: StockHistory;
    try {
      data = normalizeDailySeries(
        symbol,
        payload,
        fx ? "Time Series FX (Daily)" : undefined,
      );
    } catch (error) {
      console.error(`Alpha Vantage payload rejected: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    this.cache.set(symbol, {
      expiresAt: this.now() + this.ttlMs,
      value: data,
    });

    return { data, cacheStatus: "MISS" };
  }
}
