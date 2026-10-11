import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import { THEME_STORAGE_KEY } from "./theme";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("ThemeToggle", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("follows the system preference when nothing is saved", () => {
    mockMatchMedia(true);

    render(<ThemeToggle />);

    expect(screen.getByRole("switch", { name: "Dark mode" }).getAttribute("aria-checked")).toBe(
      "true",
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("saves a manual choice and keeps it over the system preference", () => {
    mockMatchMedia(false);

    const { unmount } = render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch", { name: "Dark mode" }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    unmount();
    delete document.documentElement.dataset.theme;
    mockMatchMedia(false);
    render(<ThemeToggle />);

    expect(screen.getByRole("switch", { name: "Dark mode" }).getAttribute("aria-checked")).toBe(
      "true",
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
