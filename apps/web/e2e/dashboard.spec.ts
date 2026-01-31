import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard route redirects when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard/overview");
    await expect(page).toHaveURL(/\/(sign-in|login)/, { timeout: 15000 });
  });
});
