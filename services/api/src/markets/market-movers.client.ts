import { type MarketMovers, normalizeMovers } from "./normalize-movers";

const DEFAULT_TTL_MS = 15 * 60 * 1000;

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message.replace(/apikey=[^&\s]+/gi, "apikey=redacted");
}

export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

export class MarketMoversClient {
  private cached: { expiresAt: number; value: MarketMovers } | undefined;
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

  async getMovers(): Promise<{ data: MarketMovers; cacheStatus: "HIT" | "MISS" }> {
    if (this.cached && this.cached.expiresAt > this.now()) {
      return { data: this.cached.value, cacheStatus: "HIT" };
    }

    const apiKey = this.options.apiKey?.trim();
    if (!apiKey) {
      throw new ProviderNotConfiguredError();
    }

    console.info("Fetching top movers from Alpha Vantage");

    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "TOP_GAINERS_LOSERS");
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

    let data: MarketMovers;
    try {
      data = normalizeMovers(payload);
    } catch (error) {
      console.error(`Alpha Vantage payload rejected: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    this.cached = {
      expiresAt: this.now() + this.ttlMs,
      value: data,
    };

    return { data, cacheStatus: "MISS" };
  }
}
