import type { Instrument } from "@marketscope/types";
import styles from "./App.module.css";

export function IndexStrip({
  indices,
  selected,
  groupIsIndex,
  onSelect,
}: {
  indices: Instrument[];
  selected: string;
  groupIsIndex: boolean;
  onSelect: (symbol: string) => void;
}) {
  return (
    <div className={styles.indices}>
      {indices.map((index) => {
        const pressed = index.symbol === selected && groupIsIndex;
        return (
          <button
            aria-pressed={pressed}
            className={pressed ? styles.indexSelected : styles.index}
            key={index.symbol}
            onClick={() => onSelect(index.symbol)}
            type="button"
          >
            <strong>{index.symbol}</strong>
            <span>{index.name}</span>
          </button>
        );
      })}
    </div>
  );
}
