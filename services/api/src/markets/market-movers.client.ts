import {
  describeProviderError,
  providerRuntime,
  readProviderJson,
  TtlCache,
} from "../provider-cache";
import { type MarketMovers, normalizeMovers } from "./normalize-movers";

const MOVERS_KEY = "movers";

export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

export class MarketMoversClient {
  private readonly cache: TtlCache<MarketMovers>;
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
    this.cache = new TtlCache(runtime.now, runtime.ttlMs, 1);
  }

  async getMovers(): Promise<{ data: MarketMovers; cacheStatus: "HIT" | "MISS" }> {
    const cached = this.cache.get(MOVERS_KEY);
    if (cached) {
      return { data: cached, cacheStatus: "HIT" };
    }

    const apiKey = this.options.apiKey?.trim();
    if (!apiKey) {
      throw new ProviderNotConfiguredError();
    }

    console.info("Fetching top movers from Alpha Vantage");

    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "TOP_GAINERS_LOSERS");
    url.searchParams.set("apikey", apiKey);

    const payload = await this.read(url);
    const data = this.normalize(payload);
    this.cache.set(MOVERS_KEY, data);
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

  private normalize(payload: unknown): MarketMovers {
    try {
      return normalizeMovers(payload);
    } catch (error) {
      console.error(`Alpha Vantage payload rejected: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }
}
