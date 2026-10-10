import type { EconomySeriesId } from "@marketscope/types";
import { useQuery } from "@tanstack/react-query";
import { ErrorState, Skeleton } from "@marketscope/ui";
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

export function EconomyChart({ id }: { id: EconomySeriesId }) {
  const series = useQuery({
    queryKey: ["economy", id],
    queryFn: () => fetchEconomySeries(id),
  });

  if (series.isPending) {
    return <Skeleton height={320} />;
  }

  if (series.isError) {
    const message =
      series.error instanceof Error ? series.error.message : "Economic data is unavailable.";
    return <ErrorState message={message} title="This indicator is unavailable" />;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{series.data.title}</h2>
      <p className={styles.unit}>{series.data.unit}</p>
      <div className={styles.chart}>
        <ResponsiveContainer>
          <LineChart data={series.data.points}>
            <CartesianGrid stroke="#e6eaf0" />
            <XAxis dataKey="date" minTickGap={32} />
            <YAxis domain={["auto", "auto"]} width={72} />
            <Tooltip />
            <Line type="monotone" dataKey="value" dot={false} stroke="#1d4ed8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p>Source: FRED, series {series.data.seriesId}.</p>
    </section>
  );
}
