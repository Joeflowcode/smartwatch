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

test("FAQ accordion and features CTAs render", async ({ page }) => {
  await page.goto("/faq");
  await expect(page.getByRole("heading", { name: "FAQ" })).toBeVisible();
  await page.getByText("Is EdgePilot AI a sportsbook?").click();
  await expect(page.getByText(/do not accept wagers/i).first()).toBeVisible();

  await page.goto("/features");
  await expect(page.getByRole("heading", { name: "Features" })).toBeVisible();
  await expect(page.getByRole("link", { name: /open odds/i })).toBeVisible();
});
