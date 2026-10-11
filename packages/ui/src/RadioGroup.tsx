import styles from "./RadioGroup.module.css";

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string; disabled?: boolean; title?: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div aria-label={label} className={styles.group} role="radiogroup">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            aria-checked={selected}
            className={selected ? styles.selected : styles.option}
            disabled={option.disabled}
            key={option.id}
            onClick={() => onChange(option.id)}
            role="radio"
            title={option.title}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
