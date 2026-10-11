import type { MarketMover, MarketMovers } from "@marketscope/types";

export type { MarketMover, MarketMovers };

const MOVER_LIMIT = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMover(value: unknown): MarketMover | undefined {
  if (!isRecord(value) || typeof value.ticker !== "string") {
    return undefined;
  }

  const price = Number(value.price);
  const change = Number(value.change_amount);
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(change) ||
    typeof value.change_percentage !== "string"
  ) {
    return undefined;
  }

  const name = typeof value.name === "string" && value.name.length > 0 ? value.name : value.ticker;
  return {
    symbol: value.ticker,
    name,
    price,
    change,
    changePercent: value.change_percentage,
  };
}

function readMovers(value: unknown): MarketMover[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      const mover = readMover(item);
      return mover ? [mover] : [];
    })
    .slice(0, MOVER_LIMIT);
}

export function normalizeMovers(payload: unknown): MarketMovers {
  if (!isRecord(payload)) {
    throw new Error("Market data provider returned an unreadable response");
  }

  const providerMessage = [payload["Error Message"], payload["Note"], payload["Information"]].find(
    (value) => typeof value === "string",
  );
  if (typeof providerMessage === "string") {
    throw new Error(providerMessage);
  }

  if (!Array.isArray(payload.top_gainers) || !Array.isArray(payload.top_losers)) {
    throw new Error("Market data provider did not return movers");
  }

  return {
    source: "alpha-vantage",
    updatedAt: typeof payload.last_updated === "string" ? payload.last_updated : null,
    gainers: readMovers(payload.top_gainers),
    losers: readMovers(payload.top_losers),
  };
}
