import { test, expect } from "@playwright/test";

test.describe("Marketing pages", () => {
  test("landing page loads and shows key content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Everything you need")).toBeVisible({ timeout: 10000 });
  });

  test("pricing page loads and shows plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1:has-text('Pricing')")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Choose the plan")).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});
