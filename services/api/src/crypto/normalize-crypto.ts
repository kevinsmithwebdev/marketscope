export type CryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  changePercent24h: number | null;
  rank: number | null;
};

export type CryptoAssetList = {
  source: "coingecko";
  assets: CryptoAsset[];
};

export type CryptoHistory = {
  id: string;
  source: "coingecko";
  points: { date: string; close: number }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function normalizeAsset(value: unknown): CryptoAsset | undefined {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.symbol !== "string") {
    return undefined;
  }
  if (typeof value.name !== "string") {
    return undefined;
  }

  const price = readNumber(value.current_price);
  const marketCap = readNumber(value.market_cap);
  const volume = readNumber(value.total_volume);
  if (price === undefined || marketCap === undefined || volume === undefined) {
    return undefined;
  }

  const change = readNumber(value.price_change_percentage_24h);
  const rank = readNumber(value.market_cap_rank);

  return {
    id: value.id,
    symbol: value.symbol.toUpperCase(),
    name: value.name,
    price,
    marketCap,
    volume,
    changePercent24h: change ?? null,
    rank: rank ?? null,
  };
}

export function normalizeAssetList(payload: unknown): CryptoAssetList {
  if (!Array.isArray(payload)) {
    throw new Error("Crypto provider did not return a market list");
  }

  const assets = payload.flatMap((item) => {
    const asset = normalizeAsset(item);
    return asset ? [asset] : [];
  });

  if (assets.length === 0) {
    throw new Error("Crypto provider did not return a market list");
  }

  return { source: "coingecko", assets };
}

export function normalizeCoinDetail(payload: unknown): CryptoAsset {
  if (!isRecord(payload) || !isRecord(payload.market_data)) {
    throw new Error("Crypto provider did not return an asset");
  }

  const marketData = payload.market_data;
  const currentPrice = isRecord(marketData.current_price)
    ? marketData.current_price.usd
    : undefined;
  const marketCap = isRecord(marketData.market_cap) ? marketData.market_cap.usd : undefined;
  const volume = isRecord(marketData.total_volume) ? marketData.total_volume.usd : undefined;
  const change = readNumber(marketData.price_change_percentage_24h);
  const asset = normalizeAsset({
    id: payload.id,
    symbol: payload.symbol,
    name: payload.name,
    current_price: currentPrice,
    market_cap: marketCap,
    total_volume: volume,
    price_change_percentage_24h: change,
    market_cap_rank: payload.market_cap_rank,
  });

  if (!asset) {
    throw new Error("Crypto provider did not return an asset");
  }

  return asset;
}

export function normalizeHistory(
  id: string,
  payload: unknown,
  resolution: "day" | "intraday" = "day",
): CryptoHistory {
  if (!isRecord(payload) || !Array.isArray(payload.prices)) {
    throw new Error("Crypto provider did not return price history");
  }

  const byTime = new Map<string, number>();
  for (const point of payload.prices) {
    if (!Array.isArray(point) || point.length < 2) {
      continue;
    }
    const timestamp = point[0];
    const price = point[1];
    if (typeof timestamp !== "number" || typeof price !== "number" || !Number.isFinite(price)) {
      continue;
    }
    const date =
      resolution === "intraday"
        ? new Date(timestamp).toISOString()
        : new Date(timestamp).toISOString().slice(0, 10);
    byTime.set(date, price);
  }

  const points = [...byTime.entries()]
    .map(([date, close]) => ({ date, close }))
    .sort((left, right) => left.date.localeCompare(right.date));

  if (points.length === 0) {
    throw new Error("Crypto provider did not return price history");
  }

  return { id, source: "coingecko", points };
}
