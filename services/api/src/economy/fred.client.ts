import { type EconomySeries, normalizeObservations } from "./normalize-observations";
import { ECONOMY_SERIES, type EconomySeriesId } from "./series";

const DEFAULT_TTL_MS = 15 * 60 * 1000;

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message.replace(/api_key=[^&\s]+/gi, "api_key=redacted");
}

export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

type CacheEntry = { expiresAt: number; value: EconomySeries };

export class FredClient {
  private readonly cache = new Map<EconomySeriesId, CacheEntry>();
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

  async getSeries(id: EconomySeriesId): Promise<{ data: EconomySeries; cacheStatus: "HIT" | "MISS" }> {
    const cached = this.cache.get(id);
    if (cached && cached.expiresAt > this.now()) {
      return { data: cached.value, cacheStatus: "HIT" };
    }

    const apiKey = this.options.apiKey?.trim();
    if (!apiKey) {
      throw new ProviderNotConfiguredError();
    }

    const definition = ECONOMY_SERIES[id];
    const start = new Date(this.now());
    start.setFullYear(start.getFullYear() - 10);

    const url = new URL("https://api.stlouisfed.org/fred/series/observations");
    url.searchParams.set("series_id", definition.seriesId);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("units", definition.units);
    url.searchParams.set("observation_start", start.toISOString().slice(0, 10));
    url.searchParams.set("sort_order", "asc");

    console.info(`Fetching ${definition.seriesId} from FRED`);

    let payload: unknown;
    try {
      const response = await this.fetchImpl(url);
      if (!response.ok) {
        throw new ProviderRequestError();
      }
      payload = await response.json();
    } catch (error) {
      console.error(`FRED request failed: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    let data: EconomySeries;
    try {
      data = normalizeObservations(definition, payload);
    } catch (error) {
      console.error(`FRED payload rejected: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    this.cache.set(id, { expiresAt: this.now() + this.ttlMs, value: data });
    return { data, cacheStatus: "MISS" };
  }
}
