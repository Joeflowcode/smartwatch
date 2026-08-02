import { test, expect } from "@playwright/test";

test("alerts page loads in demo session", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("alerts@edgepilot.ai");
  await page.getByRole("button", { name: /continue in demo mode|log in/i }).click();
  await page.waitForURL(/\/app/);
  await page.goto("/app/alerts");
  await expect(page.getByRole("heading", { name: /alerts/i })).toBeVisible();
  await page.getByLabel("Label").fill("EV above 2%");
  await page.getByRole("button", { name: /save alert/i }).click();
  await expect(page.getByText("EV above 2%")).toBeVisible();
});

test("health endpoint reports ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const json = (await res.json()) as { ok: boolean; service: string };
  expect(json.ok).toBe(true);
  expect(json.service).toBe("edgepilot-ai");
});

test("robots and sitemap are public", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
});
