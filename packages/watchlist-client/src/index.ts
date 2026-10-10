export type WatchItem = {
  key: string;
  symbol: string;
  name: string;
  kind: "equity" | "crypto";
};

const STORAGE_KEY = "marketscope.watchlist";

function isWatchItem(value: unknown): value is WatchItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Partial<WatchItem>;
  return (
    typeof item.key === "string" &&
    typeof item.symbol === "string" &&
    typeof item.name === "string" &&
    (item.kind === "equity" || item.kind === "crypto")
  );
}

export function readWatchlist(): WatchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isWatchItem) : [];
  } catch {
    return [];
  }
}

function publish(symbol: string) {
  window.dispatchEvent(new CustomEvent("watchlist.updated", { detail: { symbol } }));
}

function writeWatchlist(items: WatchItem[], symbol: string): WatchItem[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  publish(symbol);
  return items;
}

export function addWatchItem(item: WatchItem): WatchItem[] {
  const withoutDuplicate = readWatchlist().filter((existing) => existing.key !== item.key);
  return writeWatchlist([item, ...withoutDuplicate], item.symbol);
}

export function removeWatchItem(key: string): WatchItem[] {
  const current = readWatchlist();
  const removed = current.find((item) => item.key === key);
  return writeWatchlist(
    current.filter((item) => item.key !== key),
    removed?.symbol ?? key,
  );
}
