import type { InstrumentGroup } from "@marketscope/types";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Card, ErrorState, Select, Skeleton, Tabs, useRemoteFault } from "@marketscope/ui";
import { useState } from "react";
import { AddToWatchlist } from "./AddToWatchlist";
import { fetchCatalog, HISTORY_STALE_TIME_MS } from "./api";
import { IndexStrip } from "./IndexStrip";
import { QuoteSummary } from "./QuoteSummary";
import { StockHistoryChart } from "./StockHistoryChart";
import { TopMovers } from "./TopMovers";
import styles from "./App.module.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: HISTORY_STALE_TIME_MS,
      retry: 1,
    },
  },
});

const groups: { id: InstrumentGroup; label: string }[] = [
  { id: "index", label: "Indices" },
  { id: "stock", label: "Stocks" },
  { id: "etf", label: "ETFs" },
  { id: "commodity", label: "Commodities" },
  { id: "fx", label: "FX" },
];

export function App() {
  useRemoteFault("Markets");
  return (
    <QueryClientProvider client={queryClient}>
      <MarketsPage />
    </QueryClientProvider>
  );
}

function MarketsPage() {
  const catalog = useQuery({
    queryKey: ["markets", "catalog"],
    queryFn: fetchCatalog,
  });
  const [group, setGroup] = useState<InstrumentGroup>("index");
  const [symbol, setSymbol] = useState("SPY");

  if (catalog.isPending) {
    return <Skeleton height={320} />;
  }

  if (catalog.isError) {
    const message =
      catalog.error instanceof Error ? catalog.error.message : "Market data is unavailable.";
    return <ErrorState message={message} title="Markets are unavailable" titleAs="h1" />;
  }

  const instruments = catalog.data.instruments.filter((instrument) => instrument.group === group);
  const selected = instruments.some((instrument) => instrument.symbol === symbol)
    ? symbol
    : (instruments[0]?.symbol ?? symbol);
  const selectedName =
    catalog.data.instruments.find((item) => item.symbol === selected)?.name ?? selected;

  return (
    <section className={styles.page}>
      <h1>Markets</h1>
      <p className={styles.note}>
        Index rows use traded trackers, such as SPY for the S&P 500, because the free market feed
        prices funds rather than the index itself.
      </p>
      <IndexStrip
        groupIsIndex={group === "index"}
        indices={catalog.data.instruments.filter((instrument) => instrument.group === "index")}
        onSelect={(next) => {
          setGroup("index");
          setSymbol(next);
        }}
        selected={selected}
      />
      <Card title="Latest quote">
        <QuoteSummary symbol={selected} />
        <AddToWatchlist name={selectedName} symbol={selected} />
      </Card>
      <Tabs
        label="Instrument groups"
        onChange={(id) => {
          const nextGroup = id as InstrumentGroup;
          setGroup(nextGroup);
          const next = catalog.data.instruments.find(
            (instrument) => instrument.group === nextGroup,
          );
          if (next) {
            setSymbol(next.symbol);
          }
        }}
        tabs={groups}
        value={group}
      />
      <Select
        label="Instrument"
        onChange={(event) => setSymbol(event.target.value)}
        options={instruments.map((instrument) => ({
          value: instrument.symbol,
          label: `${instrument.name} (${instrument.symbol})`,
        }))}
        value={selected}
      />
      <StockHistoryChart symbol={selected} />
      <TopMovers />
    </section>
  );
}
