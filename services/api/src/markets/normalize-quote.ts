export type InstrumentQuote = {
  symbol: string;
  price: number;
  change: number | null;
  changePercent: string | null;
  source: "alpha-vantage";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProviderError(payload: Record<string, unknown>): string | undefined {
  const providerMessage = [payload["Error Message"], payload["Note"], payload["Information"]].find(
    (value) => typeof value === "string",
  );
  return typeof providerMessage === "string" ? providerMessage : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function normalizeQuote(symbol: string, payload: unknown, fx: boolean): InstrumentQuote {
  if (!isRecord(payload)) {
    throw new Error("Market data provider returned an unreadable response");
  }

  const providerError = readProviderError(payload);
  if (providerError) {
    throw new Error(providerError);
  }

  if (fx) {
    const rate = payload["Realtime Currency Exchange Rate"];
    if (!isRecord(rate)) {
      throw new Error("Market data provider did not return an exchange rate");
    }
    const price = readNumber(rate["5. Exchange Rate"]);
    if (price === undefined) {
      throw new Error("Market data provider did not return an exchange rate");
    }
    return {
      symbol,
      price,
      change: null,
      changePercent: null,
      source: "alpha-vantage",
    };
  }

  const quote = payload["Global Quote"];
  if (!isRecord(quote)) {
    throw new Error("Market data provider did not return a quote");
  }

  const price = readNumber(quote["05. price"]);
  const change = readNumber(quote["09. change"]);
  const changePercent = quote["10. change percent"];
  if (price === undefined || change === undefined || typeof changePercent !== "string") {
    throw new Error("Market data provider did not return a quote");
  }

  return {
    symbol,
    price,
    change,
    changePercent,
    source: "alpha-vantage",
  };
}
