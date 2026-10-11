import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { MARKET_RANGES, parseChartRange, sliceByRange } from "./chart-range";

const points = [
  { date: "2020-01-01", close: 1 },
  { date: "2024-01-01", close: 2 },
  { date: "2025-12-01", close: 3 },
  { date: "2026-01-15", close: 4 },
  { date: "2026-01-20T10:00:00.000Z", close: 5 },
];

const now = new Date("2026-01-20T12:00:00.000Z");

describe("sliceByRange", () => {
  it("keeps points inside the requested window", () => {
    expect(sliceByRange(points, "1D", now).map((point) => point.date)).toEqual([
      "2026-01-20T10:00:00.000Z",
    ]);
    expect(sliceByRange(points, "1M", now).map((point) => point.date)).toEqual([
      "2026-01-15",
      "2026-01-20T10:00:00.000Z",
    ]);
    expect(sliceByRange(points, "1Y", now).map((point) => point.close)).toEqual([3, 4, 5]);
    expect(sliceByRange(points, "MAX", now)).toHaveLength(points.length);
  });
});

describe("parseChartRange", () => {
  it("accepts a range the feed can draw", () => {
    expect(parseChartRange("1M", MARKET_RANGES)).toBe("1M");
    expect(parseChartRange(undefined, MARKET_RANGES)).toBeUndefined();
  });

  it("rejects a range the feed cannot draw", () => {
    expect(() => parseChartRange("1D", MARKET_RANGES)).toThrow(BadRequestException);
  });
});
