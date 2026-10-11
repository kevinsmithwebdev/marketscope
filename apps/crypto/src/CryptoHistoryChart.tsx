import { chartRangeOptions, CRYPTO_CHART_RANGES, type ChartRange } from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { LineSeriesChart, RadioGroup } from "@marketscope/ui";
import { useState } from "react";
import { fetchCryptoHistory } from "./api";
import styles from "./CryptoHistoryChart.module.css";

const RANGE_OPTIONS = chartRangeOptions(
  CRYPTO_CHART_RANGES,
  "Free crypto history covers the past year.",
);

function seriesLabel(range: ChartRange): string {
  return range === "1D" ? "price" : "daily close";
}

function formatChartDate(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  if (!value.includes("T")) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CryptoHistoryChart({ id, name }: { id: string; name: string }) {
  const [range, setRange] = useState<ChartRange>("1M");
  const history = useQuery({
    queryKey: ["crypto", "history", id, range],
    queryFn: () => fetchCryptoHistory(id, range),
  });

  let body = <p>Loading {name} history...</p>;
  if (history.isError) {
    const message =
      history.error instanceof Error ? history.error.message : "Crypto data is unavailable.";
    body = <p role="alert">{message}</p>;
  } else if (history.data && history.data.points.length === 0) {
    body = <p>No prices returned for {name}.</p>;
  } else if (history.data) {
    body = (
      <LineSeriesChart
        data={history.data.points}
        dataKey="close"
        labelFormatter={formatChartDate}
        tickFormatter={formatChartDate}
        yAxisWidth={80}
      />
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        {name} {seriesLabel(range)}
      </h2>
      <div className={styles.ranges}>
        <RadioGroup label="Time range" onChange={setRange} options={RANGE_OPTIONS} value={range} />
      </div>
      {body}
    </section>
  );
}
