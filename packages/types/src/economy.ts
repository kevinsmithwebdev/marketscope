export type EconomySeriesId = "inflation" | "unemployment" | "interest-rates" | "gdp";

export type EconomyPoint = {
  date: string;
  value: number;
};

export type EconomySeries = {
  id: EconomySeriesId;
  title: string;
  unit: string;
  source: "fred";
  seriesId: string;
  points: EconomyPoint[];
};
