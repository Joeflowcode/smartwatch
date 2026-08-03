import { test, expect } from "@playwright/test";

test.describe("demo product flow", () => {
  test("signup demo mode reaches dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill("beta@example.com");
    await page.getByRole("button", { name: /continue in demo mode|sign up/i }).click();
    await expect(page).toHaveURL(/\/app(\/onboarding)?/);
  });

  test("login demo mode can open AI assistant", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@edgepilot.ai");
    await page.getByRole("button", { name: /continue in demo mode|log in/i }).click();
    await page.waitForURL(/\/app/);
    await page.goto("/app/ai");
    await expect(page.getByRole("heading", { name: /AI research assistant/i })).toBeVisible();
    await page.getByPlaceholder(/ask a research question/i).fill("Summarize tonight's NBA slate");
    await page.getByRole("button", { name: /^Ask$/i }).click();
    await expect(page.getByText(/slate|mock|research/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("marketing homepage has primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /start free beta/i })).toBeVisible();
    await expect(page.getByText(/how the beta works/i)).toBeVisible();
  });
});
