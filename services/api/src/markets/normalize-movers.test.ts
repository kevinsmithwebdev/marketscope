import { describe, expect, it } from "vitest";
import { normalizeMovers } from "./normalize-movers";

describe("normalizeMovers", () => {
  it("keeps a short list of gainers and losers", () => {
    const movers = normalizeMovers({
      last_updated: "2024-01-02",
      top_gainers: [
        { ticker: "AAA", price: "3", change_amount: "1", change_percentage: "50%" },
        { ticker: "SKIP" },
      ],
      top_losers: [{ ticker: "BBB", price: "2", change_amount: "-0.5", change_percentage: "-20%" }],
    });

    expect(movers.gainers).toEqual([
      { symbol: "AAA", name: "AAA", price: 3, change: 1, changePercent: "50%" },
    ]);
    expect(movers.losers).toHaveLength(1);
    expect(movers.updatedAt).toBe("2024-01-02");
  });
});
