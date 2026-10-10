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

function writeWatchlist(items: WatchItem[]): WatchItem[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

export function addWatchItem(item: WatchItem): WatchItem[] {
  const withoutDuplicate = readWatchlist().filter((existing) => existing.key !== item.key);
  return writeWatchlist([item, ...withoutDuplicate]);
}

export function removeWatchItem(key: string): WatchItem[] {
  return writeWatchlist(readWatchlist().filter((item) => item.key !== key));
}
