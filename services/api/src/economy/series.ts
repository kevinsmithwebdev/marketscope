import type { EconomySeriesId } from "@marketscope/types";

export type { EconomySeriesId };

export type EconomySeriesDefinition = {
  id: EconomySeriesId;
  title: string;
  unit: string;
  seriesId: string;
  units: "lin" | "pc1";
};

export const ECONOMY_SERIES: Record<EconomySeriesId, EconomySeriesDefinition> = {
  inflation: {
    id: "inflation",
    title: "Inflation (CPI, year over year)",
    unit: "percent",
    seriesId: "CPIAUCSL",
    units: "pc1",
  },
  unemployment: {
    id: "unemployment",
    title: "Unemployment rate",
    unit: "percent",
    seriesId: "UNRATE",
    units: "lin",
  },
  "interest-rates": {
    id: "interest-rates",
    title: "Federal funds rate",
    unit: "percent",
    seriesId: "FEDFUNDS",
    units: "lin",
  },
  gdp: {
    id: "gdp",
    title: "Gross domestic product",
    unit: "billions of dollars",
    seriesId: "GDP",
    units: "lin",
  },
};

export function isEconomySeriesId(value: string): value is EconomySeriesId {
  return value in ECONOMY_SERIES;
}
