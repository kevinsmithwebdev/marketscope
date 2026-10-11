import {
  chartRangeOptions,
  ECONOMY_CHART_RANGES,
  type ChartRange,
  type EconomySeriesId,
} from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { ErrorState, LineSeriesChart, RadioGroup, Skeleton } from "@marketscope/ui";
import { useState } from "react";
import { fetchEconomySeries } from "./api";
import styles from "./EconomyChart.module.css";

const RANGE_OPTIONS = chartRangeOptions(
  ECONOMY_CHART_RANGES,
  "This indicator is published monthly or quarterly.",
);

export function EconomyChart({ id }: { id: EconomySeriesId }) {
  const [range, setRange] = useState<ChartRange>("10Y");
  const series = useQuery({
    queryKey: ["economy", id, range],
    queryFn: () => fetchEconomySeries(id, range),
  });

  let body = <Skeleton height={320} />;
  if (series.isError) {
    const message =
      series.error instanceof Error ? series.error.message : "Economic data is unavailable.";
    body = <ErrorState message={message} title="This indicator is unavailable" />;
  } else if (series.data && series.data.points.length === 0) {
    body = <p>No observations in this range.</p>;
  } else if (series.data) {
    body = (
      <>
        <h2 className={styles.title}>{series.data.title}</h2>
        <p className={styles.unit}>{series.data.unit}</p>
        <LineSeriesChart data={series.data.points} dataKey="value" />
        <p>Source: FRED, series {series.data.seriesId}.</p>
      </>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.ranges}>
        <RadioGroup label="Time range" onChange={setRange} options={RANGE_OPTIONS} value={range} />
      </div>
      {body}
    </section>
  );
}
