import { chartRangeOptions, MARKET_CHART_RANGES, type ChartRange } from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { LineSeriesChart, RadioGroup } from "@marketscope/ui";
import { useState } from "react";
import { fetchStockHistory, HISTORY_STALE_TIME_MS } from "./api";
import styles from "./StockHistoryChart.module.css";

const RANGE_OPTIONS = chartRangeOptions(
  MARKET_CHART_RANGES,
  "A one-day chart needs intraday prices, which this feed does not include.",
);

function seriesLabel(range: ChartRange): string {
  return range === "1W" || range === "1M" ? "daily close" : "weekly close";
}

export function StockHistoryChart({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<ChartRange>("1M");
  const history = useQuery({
    queryKey: ["markets", "stock-history", symbol, range],
    queryFn: () => fetchStockHistory(symbol, range),
    staleTime: HISTORY_STALE_TIME_MS,
  });

  let body = <p>Loading {symbol} history...</p>;
  if (history.isError) {
    const message =
      history.error instanceof Error ? history.error.message : "Market data is unavailable.";
    body = <p role="alert">{message}</p>;
  } else if (history.data && history.data.points.length === 0) {
    body = <p>No prices returned for {symbol}.</p>;
  } else if (history.data) {
    body = <LineSeriesChart data={history.data.points} dataKey="close" height={360} />;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        {symbol} {seriesLabel(range)}
      </h2>
      <div className={styles.ranges}>
        <RadioGroup label="Time range" onChange={setRange} options={RANGE_OPTIONS} value={range} />
      </div>
      {body}
      <p>Source: Alpha Vantage.</p>
      <p>
        Demonstration data. Prices may be delayed, cached, or incomplete and are not a basis for
        trading or investment decisions.
      </p>
    </section>
  );
}
