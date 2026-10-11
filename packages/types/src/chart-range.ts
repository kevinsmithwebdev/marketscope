export const CHART_RANGES = ["1D", "1W", "1M", "1Y", "5Y", "10Y", "MAX"] as const;

export type ChartRange = (typeof CHART_RANGES)[number];

export const CHART_RANGE_LABELS: Record<ChartRange, string> = {
  "1D": "1D",
  "1W": "1W",
  "1M": "1M",
  "1Y": "1Y",
  "5Y": "5Y",
  "10Y": "10Y",
  MAX: "Max",
};

export const MARKET_CHART_RANGES = [
  "1W",
  "1M",
  "1Y",
  "5Y",
  "10Y",
  "MAX",
] as const satisfies readonly ChartRange[];

export const CRYPTO_CHART_RANGES = [
  "1D",
  "1W",
  "1M",
  "1Y",
] as const satisfies readonly ChartRange[];

export const ECONOMY_CHART_RANGES = [
  "1Y",
  "5Y",
  "10Y",
  "MAX",
] as const satisfies readonly ChartRange[];

export function chartRangeOptions(
  enabled: readonly ChartRange[],
  disabledReason: string,
): { id: ChartRange; label: string; disabled: boolean; title?: string }[] {
  const allowed = new Set<ChartRange>(enabled);
  return CHART_RANGES.map((id) => {
    const disabled = !allowed.has(id);
    return {
      id,
      label: CHART_RANGE_LABELS[id],
      disabled,
      title: disabled ? disabledReason : undefined,
    };
  });
}
