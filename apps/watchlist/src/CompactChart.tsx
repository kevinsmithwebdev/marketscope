import type { WatchItem } from "@marketscope/watchlist-client";
import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { fetchCryptoHistory, fetchEquityHistory } from "./api";
import styles from "./CompactChart.module.css";

export function CompactChart({ item }: { item: WatchItem }) {
  const history = useQuery({
    queryKey: ["watchlist", "history", item.kind, item.key],
    queryFn: async () => {
      const history =
        item.kind === "crypto" ? await fetchCryptoHistory(item.key) : await fetchEquityHistory(item.key);
      return history.points;
    },
  });

  if (history.isPending) {
    return <p className={styles.status}>Loading chart...</p>;
  }

  if (history.isError) {
    return <p className={styles.status}>Chart unavailable</p>;
  }

  return (
    <div className={styles.chart}>
      <ResponsiveContainer>
        <LineChart data={history.data}>
          <Line dataKey="close" dot={false} stroke="#1d4ed8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
