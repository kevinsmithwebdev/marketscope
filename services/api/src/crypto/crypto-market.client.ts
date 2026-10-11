import { sliceByRange, type ChartRange } from "../chart-range";
import {
  type CryptoAsset,
  type CryptoAssetList,
  type CryptoHistory,
  normalizeAssetList,
  normalizeCoinDetail,
  normalizeHistory,
} from "./normalize-crypto";

const ID_PATTERN = /^[a-z0-9-]{1,80}$/;
const DEFAULT_TTL_MS = 15 * 60 * 1000;
const MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets";

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message;
}

export class InvalidAssetError extends Error {}
export class ProviderRequestError extends Error {}

type CacheEntry<T> = { expiresAt: number; value: T };

export class CryptoMarketClient {
  private assets: CacheEntry<CryptoAssetList> | undefined;
  private readonly history = new Map<string, CacheEntry<CryptoHistory>>();
  private readonly details = new Map<string, CacheEntry<CryptoAsset>>();
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly ttlMs: number;

  constructor(options?: { fetchImpl?: typeof fetch; now?: () => number; ttlMs?: number }) {
    this.fetchImpl = options?.fetchImpl ?? fetch;
    this.now = options?.now ?? Date.now;
    this.ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  }

  async getAssets(): Promise<{ data: CryptoAssetList; cacheStatus: "HIT" | "MISS" }> {
    if (this.assets && this.assets.expiresAt > this.now()) {
      return { data: this.assets.value, cacheStatus: "HIT" };
    }

    const url = new URL(MARKETS_URL);
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("order", "market_cap_desc");
    url.searchParams.set("per_page", "25");
    url.searchParams.set("page", "1");
    url.searchParams.set("sparkline", "false");

    const payload = await this.read(url);
    let data: CryptoAssetList;
    try {
      data = normalizeAssetList(payload);
    } catch (error) {
      console.error(`CoinGecko payload rejected: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    this.assets = { expiresAt: this.now() + this.ttlMs, value: data };
    return { data, cacheStatus: "MISS" };
  }

  async getAsset(rawId: string): Promise<{ data: CryptoAsset; cacheStatus: "HIT" | "MISS" }> {
    const id = this.parseId(rawId);
    const cached = this.details.get(id);
    if (cached && cached.expiresAt > this.now()) {
      return { data: cached.value, cacheStatus: "HIT" };
    }

    const list = await this.getAssets();
    const known = list.data.assets.find((asset) => asset.id === id);
    if (known) {
      this.details.set(id, { expiresAt: this.now() + this.ttlMs, value: known });
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
    let data: CryptoAsset;
    try {
      data = normalizeCoinDetail(payload);
    } catch (error) {
      console.error(`CoinGecko payload rejected: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    this.details.set(id, { expiresAt: this.now() + this.ttlMs, value: data });
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
    if (cached && cached.expiresAt > this.now()) {
      return { data: cached.value, cacheStatus: "HIT" };
    }

    const url = new URL(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`);
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("days", days);

    const payload = await this.read(url);
    let data: CryptoHistory;
    try {
      data = normalizeHistory(id, payload, resolution);
    } catch (error) {
      console.error(`CoinGecko payload rejected: ${describeError(error)}`);
      throw new ProviderRequestError();
    }

    this.history.set(cacheKey, { expiresAt: this.now() + this.ttlMs, value: data });
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
      const response = await this.fetchImpl(url, {
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        throw new ProviderRequestError();
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ProviderRequestError) {
        throw error;
      }
      console.error(`CoinGecko request failed: ${describeError(error)}`);
      throw new ProviderRequestError();
    }
  }
}
