import { sliceByRange, type ChartRange } from "../chart-range";
import {
  describeProviderError,
  providerRuntime,
  readProviderJson,
  TtlCache,
} from "../provider-cache";
import {
  type CryptoAsset,
  type CryptoAssetList,
  type CryptoHistory,
  normalizeAssetList,
  normalizeCoinDetail,
  normalizeHistory,
} from "./normalize-crypto";

const ID_PATTERN = /^[a-z0-9-]{1,80}$/;
const MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets";
const ASSET_LIST_KEY = "assets";

export class InvalidAssetError extends Error {}
export class ProviderRequestError extends Error {}

export class CryptoMarketClient {
  private readonly assets: TtlCache<CryptoAssetList>;
  private readonly history: TtlCache<CryptoHistory>;
  private readonly details: TtlCache<CryptoAsset>;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;

  constructor(options?: { fetchImpl?: typeof fetch; now?: () => number; ttlMs?: number }) {
    const runtime = providerRuntime(options);
    this.fetchImpl = runtime.fetchImpl;
    this.now = runtime.now;
    this.assets = new TtlCache(runtime.now, runtime.ttlMs);
    this.history = new TtlCache(runtime.now, runtime.ttlMs);
    this.details = new TtlCache(runtime.now, runtime.ttlMs);
  }

  async getAssets(): Promise<{ data: CryptoAssetList; cacheStatus: "HIT" | "MISS" }> {
    const cached = this.assets.get(ASSET_LIST_KEY);
    if (cached) {
      return { data: cached, cacheStatus: "HIT" };
    }

    const url = new URL(MARKETS_URL);
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("order", "market_cap_desc");
    url.searchParams.set("per_page", "25");
    url.searchParams.set("page", "1");
    url.searchParams.set("sparkline", "false");

    const payload = await this.read(url);
    const data = this.normalize("CoinGecko payload rejected", () => normalizeAssetList(payload));
    this.assets.set(ASSET_LIST_KEY, data);
    return { data, cacheStatus: "MISS" };
  }

  async getAsset(rawId: string): Promise<{ data: CryptoAsset; cacheStatus: "HIT" | "MISS" }> {
    const id = this.parseId(rawId);
    const cached = this.details.get(id);
    if (cached) {
      return { data: cached, cacheStatus: "HIT" };
    }

    const list = await this.getAssets();
    const known = list.data.assets.find((asset) => asset.id === id);
    if (known) {
      this.details.set(id, known);
      return { data: known, cacheStatus: list.cacheStatus };
    }

    const url = new URL(`https://api.coingecko.com/api/v3/coins/${id}`);
    url.searchParams.set("localization", "false");
    url.searchParams.set("tickers", "false");
    url.searchParams.set("market_data", "true");
    url.searchParams.set("community_data", "false");
    url.searchParams.set("developer_data", "false");
    url.searchParams.set("sparkline", "false");

    const payload = await this.read(url);
    const data = this.normalize("CoinGecko payload rejected", () => normalizeCoinDetail(payload));
    this.details.set(id, data);
    return { data, cacheStatus: "MISS" };
  }

  async getHistory(
    rawId: string,
    range?: ChartRange,
  ): Promise<{ data: CryptoHistory; cacheStatus: "HIT" | "MISS" }> {
    const id = this.parseId(rawId);
    if (range === "1D") {
      return this.loadHistory(id, "1", "intraday");
    }
    if (range === "1W" || range === "1M" || range === "1Y") {
      const loaded = await this.loadHistory(id, "365", "day");
      return {
        data: {
          ...loaded.data,
          points: sliceByRange(loaded.data.points, range, new Date(this.now())),
        },
        cacheStatus: loaded.cacheStatus,
      };
    }
    return this.loadHistory(id, "30", "day");
  }

  private async loadHistory(
    id: string,
    days: string,
    resolution: "day" | "intraday",
  ): Promise<{ data: CryptoHistory; cacheStatus: "HIT" | "MISS" }> {
    const cacheKey = `${id}:${days}`;
    const cached = this.history.get(cacheKey);
    if (cached) {
      return { data: cached, cacheStatus: "HIT" };
    }

    const url = new URL(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`);
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("days", days);

    const payload = await this.read(url);
    const data = this.normalize("CoinGecko payload rejected", () =>
      normalizeHistory(id, payload, resolution),
    );
    this.history.set(cacheKey, data);
    return { data, cacheStatus: "MISS" };
  }

  private parseId(rawId: string): string {
    const id = rawId.trim().toLowerCase();
    if (!ID_PATTERN.test(id)) {
      throw new InvalidAssetError();
    }
    return id;
  }

  private async read(url: URL): Promise<unknown> {
    console.info(`Fetching ${url.pathname} from CoinGecko`);
    try {
      return await readProviderJson(this.fetchImpl, url);
    } catch (error) {
      console.error(`CoinGecko request failed: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }

  private normalize<T>(label: string, parse: () => T): T {
    try {
      return parse();
    } catch (error) {
      console.error(`${label}: ${describeProviderError(error)}`);
      throw new ProviderRequestError();
    }
  }
}
