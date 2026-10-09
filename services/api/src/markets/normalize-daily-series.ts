export type PricePoint = {
  date: string;
  close: number;
};

export type StockHistory = {
  symbol: string;
  source: "alpha-vantage";
  points: PricePoint[];
};

const DAILY_SERIES_KEY = "Time Series (Daily)";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeDailySeries(symbol: string, payload: unknown): StockHistory {
  if (!isRecord(payload)) {
    throw new Error("Market data provider returned an unreadable response");
  }

  const providerMessage = [payload["Error Message"], payload["Note"], payload["Information"]].find(
    (value) => typeof value === "string",
  );
  if (typeof providerMessage === "string") {
    throw new Error(providerMessage);
  }

  const series = payload[DAILY_SERIES_KEY];
  if (!isRecord(series)) {
    throw new Error("Market data provider did not return a daily series");
  }

  const points = Object.entries(series)
    .flatMap(([date, bar]) => {
      if (!isRecord(bar) || typeof bar["4. close"] !== "string") {
        return [];
      }

      const close = Number(bar["4. close"]);
      if (!Number.isFinite(close)) {
        return [];
      }

      return [{ date, close }];
    })
    .sort((left, right) => left.date.localeCompare(right.date));

  return {
    symbol,
    source: "alpha-vantage",
    points,
  };
}
