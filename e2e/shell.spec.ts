import { expect, test } from "@playwright/test";

test("shell loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome, Demo User" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
});

test("navigation keeps the shell mounted", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const name of ["Markets", "Crypto", "Economy", "Watchlist"]) {
    await nav.getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  }
});

test("a remote failure stays inside that remote", async ({ page }) => {
  await page.goto("/crypto");
  await expect(page.getByRole("heading", { name: "Crypto" })).toBeVisible();

  await page.getByRole("button", { name: "Developer" }).click();
  await page.getByRole("button", { name: "Stop Crypto" }).click();
  await expect(page.getByRole("heading", { name: "Crypto failed to load" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("link", { name: "Markets" }).click();
  await expect(page.getByRole("heading", { name: "Markets" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Crypto failed to load" })).toHaveCount(0);
});
