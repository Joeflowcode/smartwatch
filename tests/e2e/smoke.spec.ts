import { test, expect } from "@playwright/test";

test("homepage loads with brand and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("EdgePilot AI").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /start free/i }).first()).toBeVisible();
});

test("pricing page shows plans", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("Pro")).toBeVisible();
  await expect(page.getByText("$24.99").or(page.getByText("24.99"))).toBeVisible();
});
