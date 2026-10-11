import { addWatchItem, type WatchItem } from "@marketscope/watchlist-client";
import { Button, Input, Select } from "@marketscope/ui";
import { useState, type FormEvent } from "react";
import styles from "./App.module.css";

export function WatchlistForm() {
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
    addWatchItem({
      key,
      symbol: key,
      name: name.trim() || key,
      kind,
    });
    setSymbol("");
    setName("");
  }

  return (
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
  );
}
