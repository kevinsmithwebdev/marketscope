import type { CryptoAsset } from "@marketscope/types";
import { addWatchItem, readWatchlist } from "@marketscope/watchlist-client";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Badge, Button, DataTable, type DataTableColumn, ErrorState, Skeleton, useRemoteFault } from "@marketscope/ui";
import { useEffect, useState } from "react";
import { CRYPTO_STALE_TIME_MS, fetchAssets } from "./api";
import { CryptoHistoryChart } from "./CryptoHistoryChart";
import styles from "./App.module.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CRYPTO_STALE_TIME_MS,
      retry: 1,
    },
  },
});

function money(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  });
}

function compact(value: number) {
  return value.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 2 });
}

const columns: DataTableColumn<CryptoAsset>[] = [
  { key: "rank", header: "Rank", render: (row) => row.rank ?? "—" },
  { key: "name", header: "Name", render: (row) => `${row.name} (${row.symbol})` },
  { key: "price", header: "Price", render: (row) => money(row.price) },
  { key: "marketCap", header: "Market cap", render: (row) => compact(row.marketCap) },
  { key: "volume", header: "Volume", render: (row) => compact(row.volume) },
  {
    key: "change",
    header: "24h",
    render: (row) => {
      if (row.changePercent24h === null) {
        return "—";
      }
      const tone = row.changePercent24h < 0 ? "negative" : "positive";
      return <Badge tone={tone}>{`${row.changePercent24h.toFixed(2)}%`}</Badge>;
    },
  },
];

export function App() {
  useRemoteFault("Crypto");
  return (
    <QueryClientProvider client={queryClient}>
      <CryptoPage />
    </QueryClientProvider>
  );
}

function CryptoPage() {
  const assets = useQuery({
    queryKey: ["crypto", "assets"],
    queryFn: fetchAssets,
  });
  const [selectedId, setSelectedId] = useState("bitcoin");
  const [savedKeys, setSavedKeys] = useState<string[]>(() => readWatchlist().map((item) => item.key));

  useEffect(() => {
    function onUpdate() {
      setSavedKeys(readWatchlist().map((item) => item.key));
    }

    window.addEventListener("watchlist.updated", onUpdate);
    return () => window.removeEventListener("watchlist.updated", onUpdate);
  }, []);

  if (assets.isPending) {
    return <Skeleton height={320} />;
  }

  if (assets.isError) {
    const message = assets.error instanceof Error ? assets.error.message : "Crypto data is unavailable.";
    return <ErrorState message={message} title="Crypto is unavailable" titleAs="h1" />;
  }

  const selected = assets.data.assets.find((asset) => asset.id === selectedId) ?? assets.data.assets[0];

  return (
    <section className={styles.page}>
      <h1>Crypto</h1>
      <p className={styles.note}>Ranked by market cap. Select a row to chart the last 30 days.</p>
      <DataTable
        columns={columns}
        getRowKey={(row) => row.id}
        onRowClick={(row) => setSelectedId(row.id)}
        rows={assets.data.assets}
      />
      {selected ? (
        <>
          <CryptoHistoryChart id={selected.id} name={selected.name} />
          <Button
            disabled={savedKeys.includes(selected.id)}
            onClick={() => {
              addWatchItem({
                key: selected.id,
                symbol: selected.symbol,
                name: selected.name,
                kind: "crypto",
              });
              window.dispatchEvent(
                new CustomEvent("marketscope.notify", {
                  detail: { message: `Added ${selected.name} to the watchlist` },
                }),
              );
            }}
            variant="secondary"
          >
            {savedKeys.includes(selected.id) ? "On watchlist" : "Add to watchlist"}
          </Button>
        </>
      ) : null}
      <p>Source: CoinGecko.</p>
      <p>
        Demonstration data. Prices may be delayed, cached, or incomplete and are not a basis for
        trading or investment decisions.
      </p>
    </section>
  );
}
