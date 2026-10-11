import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";
import {
  applyTheme,
  currentTheme,
  readStoredTheme,
  resolveTheme,
  systemPrefersDark,
  THEME_STORAGE_KEY,
  type Theme,
} from "./theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8">
        <path d="M12 2.8v2.3M12 18.9v2.3M2.8 12h2.3M18.9 12h2.3M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7 5.4a6.6 6.6 0 1 0 .1 0zM12.6 6.3a5.7 5.7 0 1 1-.1 0z"
      />
      <path
        fill="currentColor"
        d="m17.6 3.1.5 1.25 1.25.5-1.25.5-.5 1.25-.5-1.25-1.25-.5 1.25-.5zm2.3 3.7.32.8.8.32-.8.32-.32.8-.32-.8-.8-.32.8-.32z"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStoredTheme() === null) {
        setTheme(resolveTheme(null, systemPrefersDark()));
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Preference still applies for this visit when storage is blocked.
    }
    setTheme(next);
  }

  const dark = theme === "dark";

  return (
    <button
      aria-checked={dark}
      aria-label="Dark mode"
      className={styles.track}
      onClick={toggle}
      role="switch"
      type="button"
    >
      <span className={styles.hint}>
        <SunIcon />
      </span>
      <span className={styles.hint}>
        <MoonIcon />
      </span>
      <span className={styles.knob}>{dark ? <MoonIcon /> : <SunIcon />}</span>
    </button>
  );
}
