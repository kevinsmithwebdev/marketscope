import { addWatchItem, readWatchlist, removeWatchItem, type WatchItem } from "@marketscope/watchlist-client";
import { Button, Input, Select } from "@marketscope/ui";
import { useState, type FormEvent } from "react";
import styles from "./App.module.css";

export function App() {
  const [items, setItems] = useState<WatchItem[]>(() => readWatchlist());
  const [kind, setKind] = useState<WatchItem["kind"]>("equity");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");

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
      {items.length === 0 ? (
        <p className={styles.empty}>Your watchlist is empty.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li className={styles.row} key={item.key}>
              <div>
                <strong>{item.name}</strong>
                <p className={styles.symbol}>
                  {item.symbol} · {item.kind}
                </p>
              </div>
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
