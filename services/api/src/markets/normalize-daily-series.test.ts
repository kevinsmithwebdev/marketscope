import { describe, expect, it } from "vitest";
import { normalizeDailySeries } from "./normalize-daily-series";

describe("normalizeDailySeries", () => {
  it("keeps finite closes and sorts them by date", () => {
    const history = normalizeDailySeries("SPY", {
      "Time Series (Daily)": {
        "2024-01-03": { "4. close": "11" },
        "2024-01-02": { "4. close": "10.5" },
        "2024-01-04": { "4. close": "nope" },
      },
    });

    expect(history).toEqual({
      symbol: "SPY",
      source: "alpha-vantage",
      points: [
        { date: "2024-01-02", close: 10.5 },
        { date: "2024-01-03", close: 11 },
      ],
    });
  });

  it("rejects a provider note instead of treating it as prices", () => {
    expect(() => normalizeDailySeries("SPY", { Note: "rate limit" })).toThrow("rate limit");
  });
});
