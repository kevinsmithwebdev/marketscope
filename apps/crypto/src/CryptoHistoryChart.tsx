import { chartRangeOptions, CRYPTO_CHART_RANGES, type ChartRange } from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup } from "@marketscope/ui";
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
      <div className={styles.chart}>
        <ResponsiveContainer>
          <LineChart data={history.data.points}>
            <CartesianGrid stroke="#e6eaf0" />
            <XAxis dataKey="date" minTickGap={32} tickFormatter={formatChartDate} />
            <YAxis domain={["auto", "auto"]} width={80} />
            <Tooltip labelFormatter={formatChartDate} />
            <Line type="monotone" dataKey="close" dot={false} stroke="#1d4ed8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
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
