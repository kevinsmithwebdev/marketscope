import styles from "./Tabs.module.css";

export function Tabs({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div aria-label={label} className={styles.tabs} role="tablist">
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            aria-selected={selected}
            className={selected ? styles.selected : styles.tab}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
