import { sliceByRange, usesWeeklyHistory, type ChartRange } from "../chart-range";
import {
  describeProviderError,
  providerRuntime,
  readProviderJson,
  TtlCache,
} from "../provider-cache";
import type { InstrumentGroup } from "./catalog";
import { normalizeDailySeries, type StockHistory } from "./normalize-daily-series";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,10}$/;

function seriesKey(interval: "daily" | "weekly", fx: boolean): string {
  if (fx) {
    return interval === "weekly" ? "Time Series FX (Weekly)" : "Time Series FX (Daily)";
  }
  return interval === "weekly" ? "Weekly Time Series" : "Time Series (Daily)";
}

export class InvalidSymbolError extends Error {}
export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

export class MarketHistoryClient {
  private readonly cache: TtlCache<StockHistory>;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;

  constructor(
    private readonly options: {
      apiKey: string | undefined;
      fetchImpl?: typeof fetch;
      now?: () => number;
      ttlMs?: number;
    },
  ) {
    const runtime = providerRuntime(options);
    this.fetchImpl = runtime.fetchImpl;
    this.now = runtime.now;
    this.cache = new TtlCache(runtime.now, runtime.ttlMs);
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
    if (cached) {
      return { data: cached, cacheStatus: "HIT" };
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

    const payload = await this.read(url);
    const data = this.normalize(symbol, payload, seriesKey(interval, fx));
    this.cache.set(cacheKey, data);
    return { data, cacheStatus: "MISS" };
  }

  private async read(url: URL): Promise<unknown> {
    try {
      return await readProviderJson(this.fetchImpl, url);
    } catch (error) {
      console.error(`Alpha Vantage request failed: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }

  private normalize(symbol: string, payload: unknown, seriesKeyName: string): StockHistory {
    try {
      return normalizeDailySeries(symbol, payload, seriesKeyName);
    } catch (error) {
      console.error(`Alpha Vantage payload rejected: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }
}
