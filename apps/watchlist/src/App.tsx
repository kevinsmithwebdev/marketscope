import { readWatchlist, type WatchItem } from "@marketscope/watchlist-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRemoteFault } from "@marketscope/ui";
import { useEffect, useState } from "react";
import { WATCHLIST_STALE_TIME_MS } from "./api";
import styles from "./App.module.css";
import { WatchlistForm } from "./WatchlistForm";
import { WatchlistList } from "./WatchlistList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: WATCHLIST_STALE_TIME_MS,
      retry: 1,
    },
  },
});

function useWatchlist(): WatchItem[] {
  const [items, setItems] = useState<WatchItem[]>(() => readWatchlist());

  useEffect(() => {
    function onUpdate() {
      setItems(readWatchlist());
    }

    window.addEventListener("watchlist.updated", onUpdate);
    return () => window.removeEventListener("watchlist.updated", onUpdate);
  }, []);

  return items;
}

export function App() {
  useRemoteFault("Watchlist");
  return (
    <QueryClientProvider client={queryClient}>
      <WatchlistPage />
    </QueryClientProvider>
  );
}

function WatchlistPage() {
  const items = useWatchlist();

  return (
    <section className={styles.page}>
      <h1>Watchlist</h1>
      <p>Saved in this browser. Leaving the page does not clear it.</p>
      <WatchlistForm />
      <WatchlistList items={items} />
    </section>
  );
}
