import { describe, expect, it } from "vitest";
import { normalizeQuote } from "./normalize-quote";

describe("normalizeQuote", () => {
  it("reads a stock quote", () => {
    expect(
      normalizeQuote(
        "SPY",
        {
          "Global Quote": {
            "05. price": "100.25",
            "09. change": "-1.5",
            "10. change percent": "-1.47%",
          },
        },
        false,
      ),
    ).toEqual({
      symbol: "SPY",
      price: 100.25,
      change: -1.5,
      changePercent: "-1.47%",
      source: "alpha-vantage",
    });
  });

  it("reads an fx rate without inventing a change", () => {
    expect(
      normalizeQuote(
        "EURUSD",
        { "Realtime Currency Exchange Rate": { "5. Exchange Rate": "1.08" } },
        true,
      ),
    ).toMatchObject({ symbol: "EURUSD", price: 1.08, change: null, changePercent: null });
  });
});
