export const THEME_STORAGE_KEY = "marketscope.theme";

export type Theme = "light" | "dark";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

/** Saved choice wins. Otherwise follow the operating system. */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) {
    return stored;
  }
  return prefersDark ? "dark" : "light";
}

export function readStoredTheme(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function currentTheme(): Theme {
  const applied = document.documentElement.dataset.theme;
  if (isTheme(applied)) {
    return applied;
  }
  return resolveTheme(readStoredTheme(), systemPrefersDark());
}
