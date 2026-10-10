import { addWatchItem, readWatchlist, removeWatchItem, type WatchItem } from "@marketscope/watchlist-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button, Input, Select, useRemoteFault } from "@marketscope/ui";
import { useEffect, useState, type FormEvent } from "react";
import { WATCHLIST_STALE_TIME_MS } from "./api";
import { CompactChart } from "./CompactChart";
import styles from "./App.module.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: WATCHLIST_STALE_TIME_MS,
      retry: 1,
    },
  },
});

export function App() {
  useRemoteFault("Watchlist");
  return (
    <QueryClientProvider client={queryClient}>
      <WatchlistPage />
    </QueryClientProvider>
  );
}

function WatchlistPage() {
  const [items, setItems] = useState<WatchItem[]>(() => readWatchlist());
  const [kind, setKind] = useState<WatchItem["kind"]>("equity");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("added");

  useEffect(() => {
    function onUpdate() {
      setItems(readWatchlist());
    }

    window.addEventListener("watchlist.updated", onUpdate);
    return () => window.removeEventListener("watchlist.updated", onUpdate);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = symbol.trim();
    if (!trimmed) {
      return;
    }

    const key = kind === "crypto" ? trimmed.toLowerCase() : trimmed.toUpperCase();
    const next = addWatchItem({
      key,
      symbol: key,
      name: name.trim() || key,
      kind,
    });
    setItems(next);
    setSymbol("");
    setName("");
  }

  const needle = filter.trim().toLowerCase();
  const visible = items
    .filter((item) => `${item.symbol} ${item.name}`.toLowerCase().includes(needle))
    .sort((left, right) => {
      if (sort === "symbol") {
        return left.symbol.localeCompare(right.symbol);
      }
      if (sort === "name") {
        return left.name.localeCompare(right.name);
      }
      return 0;
    });

  return (
    <section className={styles.page}>
      <h1>Watchlist</h1>
      <p>Saved in this browser. Leaving the page does not clear it.</p>
      <form className={styles.form} onSubmit={onSubmit}>
        <Select
          label="Kind"
          onChange={(event) => setKind(event.target.value as WatchItem["kind"])}
          options={[
            { value: "equity", label: "Equity or fund" },
            { value: "crypto", label: "Crypto" },
          ]}
          value={kind}
        />
        <Input
          label={kind === "crypto" ? "Coin id" : "Symbol"}
          onChange={(event) => setSymbol(event.target.value)}
          value={symbol}
        />
        <Input label="Name" onChange={(event) => setName(event.target.value)} value={name} />
        <Button type="submit">Add</Button>
      </form>
      <div className={styles.form}>
        <Input label="Filter" onChange={(event) => setFilter(event.target.value)} value={filter} />
        <Select
          label="Sort"
          onChange={(event) => setSort(event.target.value)}
          options={[
            { value: "added", label: "Recently added" },
            { value: "symbol", label: "Symbol" },
            { value: "name", label: "Name" },
          ]}
          value={sort}
        />
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>Your watchlist is empty.</p>
      ) : visible.length === 0 ? (
        <p className={styles.empty}>No instruments match that filter.</p>
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => (
            <li className={styles.row} key={item.key}>
              <div>
                <strong>{item.name}</strong>
                <p className={styles.symbol}>
                  {item.symbol} · {item.kind}
                </p>
              </div>
              <CompactChart item={item} />
              <Button
                onClick={() => setItems(removeWatchItem(item.key))}
                variant="secondary"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
