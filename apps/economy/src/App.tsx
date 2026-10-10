import type { EconomySeriesId } from "@marketscope/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "@marketscope/ui";
import { useState } from "react";
import { ECONOMY_STALE_TIME_MS } from "./api";
import { EconomyChart } from "./EconomyChart";
import styles from "./App.module.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ECONOMY_STALE_TIME_MS,
      retry: 1,
    },
  },
});

const tabs: { id: EconomySeriesId; label: string }[] = [
  { id: "inflation", label: "Inflation" },
  { id: "unemployment", label: "Unemployment" },
  { id: "interest-rates", label: "Interest rates" },
  { id: "gdp", label: "GDP" },
];

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EconomyPage />
    </QueryClientProvider>
  );
}

function EconomyPage() {
  const [seriesId, setSeriesId] = useState<EconomySeriesId>("inflation");

  return (
    <section className={styles.page}>
      <h1>Economy</h1>
      <p className={styles.note}>United States indicators from FRED, covering about the last ten years.</p>
      <Tabs
        label="Economic indicators"
        onChange={(id) => setSeriesId(id as EconomySeriesId)}
        tabs={tabs}
        value={seriesId}
      />
      <EconomyChart id={seriesId} />
      <p>
        Demonstration data. Figures may be revised, cached, or incomplete and are not a basis for
        trading or investment decisions.
      </p>
    </section>
  );
}
