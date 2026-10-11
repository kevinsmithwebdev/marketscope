import { BadRequestException } from "@nestjs/common";

export const CHART_RANGES = ["1D", "1W", "1M", "1Y", "5Y", "10Y", "MAX"] as const;

export type ChartRange = (typeof CHART_RANGES)[number];

export const MARKET_RANGES = [
  "1W",
  "1M",
  "1Y",
  "5Y",
  "10Y",
  "MAX",
] as const satisfies readonly ChartRange[];

export const CRYPTO_RANGES = ["1D", "1W", "1M", "1Y"] as const satisfies readonly ChartRange[];

export const ECONOMY_RANGES = ["1Y", "5Y", "10Y", "MAX"] as const satisfies readonly ChartRange[];

const WEEKLY_RANGES = new Set<ChartRange>(["1Y", "5Y", "10Y", "MAX"]);

export function isChartRange(value: string): value is ChartRange {
  return (CHART_RANGES as readonly string[]).includes(value);
}

export function parseChartRange(
  value: string | undefined,
  allowed: readonly ChartRange[],
): ChartRange | undefined {
  if (value === undefined || value.length === 0) {
    return undefined;
  }
  if (!isChartRange(value) || !allowed.includes(value)) {
    throw new BadRequestException("Range is not valid");
  }
  return value;
}

export function usesWeeklyHistory(range: ChartRange): boolean {
  return WEEKLY_RANGES.has(range);
}

export function sliceByRange<T extends { date: string }>(
  points: readonly T[],
  range: ChartRange,
  now: Date,
): T[] {
  if (range === "MAX") {
    return [...points];
  }

  const start = new Date(now.getTime());
  if (range === "1D") {
    start.setUTCDate(start.getUTCDate() - 1);
  } else if (range === "1W") {
    start.setUTCDate(start.getUTCDate() - 7);
  } else if (range === "1M") {
    start.setUTCMonth(start.getUTCMonth() - 1);
  } else if (range === "1Y") {
    start.setUTCFullYear(start.getUTCFullYear() - 1);
  } else if (range === "5Y") {
    start.setUTCFullYear(start.getUTCFullYear() - 5);
  } else {
    start.setUTCFullYear(start.getUTCFullYear() - 10);
  }

  const cutoff = start.getTime();
  return points.filter((point) => pointTime(point.date) >= cutoff);
}

function pointTime(date: string): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Date.parse(`${date}T00:00:00.000Z`);
  }
  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}
