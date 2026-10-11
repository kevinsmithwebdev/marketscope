import {
  CRYPTO_CHART_RANGES,
  ECONOMY_CHART_RANGES,
  isChartRange,
  MARKET_CHART_RANGES,
  sliceByRange,
  usesWeeklyHistory,
  type ChartRange,
} from "@marketscope/types";
import { BadRequestException } from "@nestjs/common";

export { sliceByRange, usesWeeklyHistory };
export type { ChartRange };

export const MARKET_RANGES = MARKET_CHART_RANGES;
export const CRYPTO_RANGES = CRYPTO_CHART_RANGES;
export const ECONOMY_RANGES = ECONOMY_CHART_RANGES;

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
