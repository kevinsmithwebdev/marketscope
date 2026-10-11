import {
  describeProviderError,
  providerRuntime,
  readProviderJson,
  TtlCache,
} from "../provider-cache";
import type { InstrumentGroup } from "./catalog";
import { type InstrumentQuote, normalizeQuote } from "./normalize-quote";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,10}$/;

export class InvalidSymbolError extends Error {}
export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

export class MarketQuoteClient {
  private readonly cache: TtlCache<InstrumentQuote>;
  private readonly fetchImpl: typeof fetch;

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
    this.cache = new TtlCache(runtime.now, runtime.ttlMs);
  }

  async getQuote(
    rawSymbol: string,
    group?: InstrumentGroup,
  ): Promise<{ data: InstrumentQuote; cacheStatus: "HIT" | "MISS" }> {
    const symbol = rawSymbol.trim().toUpperCase();
    if (!SYMBOL_PATTERN.test(symbol)) {
      throw new InvalidSymbolError();
    }

    const cached = this.cache.get(symbol);
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

    console.info(`Fetching ${symbol} quote from Alpha Vantage`);

    const url = new URL("https://www.alphavantage.co/query");
    if (fx) {
      url.searchParams.set("function", "CURRENCY_EXCHANGE_RATE");
      url.searchParams.set("from_currency", symbol.slice(0, 3));
      url.searchParams.set("to_currency", symbol.slice(3));
    } else {
      url.searchParams.set("function", "GLOBAL_QUOTE");
      url.searchParams.set("symbol", symbol);
    }
    url.searchParams.set("apikey", apiKey);

    const payload = await this.read(url);
    const data = this.normalize(symbol, payload, fx);
    this.cache.set(symbol, data);
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

  private normalize(symbol: string, payload: unknown, fx: boolean): InstrumentQuote {
    try {
      return normalizeQuote(symbol, payload, fx);
    } catch (error) {
      console.error(`Alpha Vantage payload rejected: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }
}
