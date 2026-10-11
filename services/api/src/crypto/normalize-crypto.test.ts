import { describe, expect, it } from "vitest";
import { normalizeAssetList, normalizeHistory } from "./normalize-crypto";

describe("crypto normalization", () => {
  it("maps a market list into ranked assets", () => {
    const list = normalizeAssetList([
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 100,
        market_cap: 200,
        total_volume: 300,
        price_change_percentage_24h: 1.25,
        market_cap_rank: 1,
      },
    ]);

    expect(list.assets[0]).toMatchObject({
      id: "bitcoin",
      symbol: "BTC",
      price: 100,
      rank: 1,
    });
  });

  it("collapses intraday points to one close per day", () => {
    const history = normalizeHistory("bitcoin", {
      prices: [
        [Date.parse("2024-01-02T01:00:00Z"), 10],
        [Date.parse("2024-01-02T12:00:00Z"), 12],
        [Date.parse("2024-01-03T00:00:00Z"), 11],
      ],
    });

    expect(history.points).toEqual([
      { date: "2024-01-02", close: 12 },
      { date: "2024-01-03", close: 11 },
    ]);
  });

  it("keeps intraday timestamps for a one-day chart", () => {
    const history = normalizeHistory(
      "bitcoin",
      {
        prices: [
          [Date.parse("2024-01-02T01:00:00.000Z"), 10],
          [Date.parse("2024-01-02T01:05:00.000Z"), 12],
        ],
      },
      "intraday",
    );

    expect(history.points).toEqual([
      { date: "2024-01-02T01:00:00.000Z", close: 10 },
      { date: "2024-01-02T01:05:00.000Z", close: 12 },
    ]);
  });
});
