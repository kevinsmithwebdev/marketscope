import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchCryptoHistory } from "./api";
import styles from "./CryptoHistoryChart.module.css";

export function CryptoHistoryChart({ id, name }: { id: string; name: string }) {
  const history = useQuery({
    queryKey: ["crypto", "history", id],
    queryFn: () => fetchCryptoHistory(id),
  });

  if (history.isPending) {
    return <p>Loading {name} history...</p>;
  }

  if (history.isError) {
    const message = history.error instanceof Error ? history.error.message : "Crypto data is unavailable.";
    return <p role="alert">{message}</p>;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{name} daily close</h2>
      <div className={styles.chart}>
        <ResponsiveContainer>
          <LineChart data={history.data.points}>
            <CartesianGrid stroke="#e6eaf0" />
            <XAxis dataKey="date" minTickGap={32} />
            <YAxis domain={["auto", "auto"]} width={80} />
            <Tooltip />
            <Line type="monotone" dataKey="close" dot={false} stroke="#1d4ed8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
