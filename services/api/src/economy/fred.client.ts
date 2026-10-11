import { sliceByRange, type ChartRange } from "../chart-range";
import {
  describeProviderError,
  providerRuntime,
  readProviderJson,
  TtlCache,
} from "../provider-cache";
import { type EconomySeries, normalizeObservations } from "./normalize-observations";
import { ECONOMY_SERIES, type EconomySeriesId } from "./series";

export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

export class FredClient {
  private readonly cache: TtlCache<EconomySeries>;
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

  async getSeries(
    id: EconomySeriesId,
    range?: ChartRange,
  ): Promise<{ data: EconomySeries; cacheStatus: "HIT" | "MISS" }> {
    const loaded = await this.loadSeries(id);
    return {
      data: {
        ...loaded.data,
        points: sliceByRange(loaded.data.points, range ?? "10Y", new Date(this.now())),
      },
      cacheStatus: loaded.cacheStatus,
    };
  }

  private async loadSeries(
    id: EconomySeriesId,
  ): Promise<{ data: EconomySeries; cacheStatus: "HIT" | "MISS" }> {
    const cached = this.cache.get(id);
    if (cached) {
      return { data: cached, cacheStatus: "HIT" };
    }

    const apiKey = this.options.apiKey?.trim();
    if (!apiKey) {
      throw new ProviderNotConfiguredError();
    }

    const definition = ECONOMY_SERIES[id];

    const url = new URL("https://api.stlouisfed.org/fred/series/observations");
    url.searchParams.set("series_id", definition.seriesId);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("units", definition.units);
    url.searchParams.set("sort_order", "asc");

    console.info(`Fetching ${definition.seriesId} from FRED`);

    const payload = await this.read(url);
    const data = this.normalize(definition, payload);
    this.cache.set(id, data);
    return { data, cacheStatus: "MISS" };
  }

  private async read(url: URL): Promise<unknown> {
    try {
      return await readProviderJson(this.fetchImpl, url);
    } catch (error) {
      console.error(`FRED request failed: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }

  private normalize(
    definition: (typeof ECONOMY_SERIES)[EconomySeriesId],
    payload: unknown,
  ): EconomySeries {
    try {
      return normalizeObservations(definition, payload);
    } catch (error) {
      console.error(`FRED payload rejected: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }
}
