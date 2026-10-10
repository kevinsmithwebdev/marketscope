import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchStockHistory, HISTORY_STALE_TIME_MS } from "./api";
import styles from "./StockHistoryChart.module.css";

export function StockHistoryChart({ symbol }: { symbol: string }) {
  const history = useQuery({
    queryKey: ["markets", "stock-history", symbol],
    queryFn: () => fetchStockHistory(symbol),
    staleTime: HISTORY_STALE_TIME_MS,
  });

  if (history.isPending) {
    return <p>Loading {symbol} history...</p>;
  }

  if (history.isError) {
    const message =
      history.error instanceof Error ? history.error.message : "Market data is unavailable.";
    return <p role="alert">{message}</p>;
  }

  if (history.data.points.length === 0) {
    return <p>No prices returned for {symbol}.</p>;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{history.data.symbol} daily close</h2>
      <div className={styles.chart}>
        <ResponsiveContainer>
          <LineChart data={history.data.points}>
            <CartesianGrid stroke="#e6eaf0" />
            <XAxis dataKey="date" minTickGap={32} />
            <YAxis domain={["auto", "auto"]} width={72} />
            <Tooltip />
            <Line type="monotone" dataKey="close" dot={false} stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p>Source: Alpha Vantage.</p>
      <p>
        Demonstration data. Prices may be delayed, cached, or incomplete and are not a basis for
        trading or investment decisions.
      </p>
    </section>
  );
}
