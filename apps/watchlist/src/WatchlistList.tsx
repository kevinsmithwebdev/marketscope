import { removeWatchItem, type WatchItem } from "@marketscope/watchlist-client";
import { Button, Input, Select } from "@marketscope/ui";
import { useState } from "react";
import { CompactChart } from "./CompactChart";
import styles from "./App.module.css";

export function WatchlistList({ items }: { items: WatchItem[] }) {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("added");
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
    <>
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
              <Button onClick={() => removeWatchItem(item.key)} variant="secondary">
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
