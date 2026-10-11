import {
  chartRangeOptions,
  ECONOMY_CHART_RANGES,
  type ChartRange,
  type EconomySeriesId,
} from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { chartTheme, ErrorState, RadioGroup, Skeleton } from "@marketscope/ui";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
        <div className={styles.chart}>
          <ResponsiveContainer>
            <LineChart data={series.data.points}>
              <CartesianGrid stroke={chartTheme.grid} />
              <XAxis
                dataKey="date"
                minTickGap={32}
                stroke={chartTheme.axis}
                tick={chartTheme.tick}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke={chartTheme.axis}
                tick={chartTheme.tick}
                width={72}
              />
              <Tooltip
                contentStyle={chartTheme.tooltip.contentStyle}
                cursor={chartTheme.tooltip.cursor}
                itemStyle={chartTheme.tooltip.itemStyle}
                labelStyle={chartTheme.tooltip.labelStyle}
              />
              <Line
                animationDuration={500}
                type="monotone"
                dataKey="value"
                dot={false}
                stroke={chartTheme.line}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
