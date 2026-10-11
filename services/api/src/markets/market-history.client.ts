import { sliceByRange, usesWeeklyHistory, type ChartRange } from "../chart-range";
import type { InstrumentGroup } from "./catalog";
import { normalizeDailySeries, type StockHistory } from "./normalize-daily-series";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,10}$/;

function seriesKey(interval: "daily" | "weekly", fx: boolean): string {
  if (fx) {
    return interval === "weekly" ? "Time Series FX (Weekly)" : "Time Series FX (Daily)";
  }
  return interval === "weekly" ? "Weekly Time Series" : "Time Series (Daily)";
}

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

  async getHistory(
    rawSymbol: string,
    group?: InstrumentGroup,
    range?: ChartRange,
  ): Promise<{
    data: StockHistory;
    cacheStatus: "HIT" | "MISS";
  }> {
    const interval = range !== undefined && usesWeeklyHistory(range) ? "weekly" : "daily";
    const loaded = await this.load(rawSymbol, group, interval);
    if (range === undefined) {
      return loaded;
    }

    return {
      data: {
        ...loaded.data,
        points: sliceByRange(loaded.data.points, range, new Date(this.now())),
      },
      cacheStatus: loaded.cacheStatus,
    };
  }

  private async load(
    rawSymbol: string,
    group: InstrumentGroup | undefined,
    interval: "daily" | "weekly",
  ): Promise<{
    data: StockHistory;
    cacheStatus: "HIT" | "MISS";
  }> {
    const symbol = rawSymbol.trim().toUpperCase();
    if (!SYMBOL_PATTERN.test(symbol)) {
      throw new InvalidSymbolError();
    }

    const cacheKey = `${interval}:${symbol}`;
    const cached = this.cache.get(cacheKey);
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

    console.info(`Fetching ${symbol} ${interval} history from Alpha Vantage`);

    const url = new URL("https://www.alphavantage.co/query");
    if (fx) {
      url.searchParams.set("function", interval === "weekly" ? "FX_WEEKLY" : "FX_DAILY");
      url.searchParams.set("from_symbol", symbol.slice(0, 3));
      url.searchParams.set("to_symbol", symbol.slice(3));
    } else {
      url.searchParams.set(
        "function",
        interval === "weekly" ? "TIME_SERIES_WEEKLY" : "TIME_SERIES_DAILY",
      );
      url.searchParams.set("symbol", symbol);
    }
    if (interval === "daily") {
      url.searchParams.set("outputsize", "compact");
    }
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
      data = normalizeDailySeries(symbol, payload, seriesKey(interval, fx));
    } catch (error) {
      console.error(`Alpha Vantage payload rejected: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    this.cache.set(cacheKey, {
      expiresAt: this.now() + this.ttlMs,
      value: data,
    });

    return { data, cacheStatus: "MISS" };
  }
}
