import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/sign-in/);
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("unauthenticated dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/(sign-in|login)/, { timeout: 15000 });
  });
});
