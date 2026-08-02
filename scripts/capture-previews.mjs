import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "/opt/cursor/artifacts/screenshots";
mkdirSync(OUT, { recursive: true });

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function shot(page, name, path) {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${OUT}/${name}.png`,
    fullPage: false,
  });
  console.log(`wrote ${name}.png`);
}

async function main() {
  const browser = await chromium.launch();

  // Desktop
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await shot(desktop, "01-home-desktop", "/");
  await shot(desktop, "02-pricing-desktop", "/pricing");
  await shot(desktop, "03-features-desktop", "/features");
  await shot(desktop, "04-faq-desktop", "/faq");

  // Demo login → dashboard
  await desktop.goto(`${base}/login`, { waitUntil: "networkidle" });
  await desktop.fill("#email", "preview@edgepilot.ai");
  await desktop.getByRole("button", { name: /continue in demo mode/i }).click();
  await desktop.waitForURL(/\/app/);
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: `${OUT}/05-dashboard-desktop.png`, fullPage: false });
  console.log("wrote 05-dashboard-desktop.png");

  await shot(desktop, "06-odds-desktop", "/app/odds");
  await shot(desktop, "07-scanner-desktop", "/app/scanner");
  await shot(desktop, "08-ai-desktop", "/app/ai");

  // Mobile home
  const iPhone = devices["iPhone 13"];
  const mobile = await browser.newPage({ ...iPhone });
  await shot(mobile, "09-home-mobile", "/");
  await shot(mobile, "10-pricing-mobile", "/pricing");

  await mobile.goto(`${base}/login`, { waitUntil: "networkidle" });
  await mobile.fill("#email", "preview@edgepilot.ai");
  await mobile.getByRole("button", { name: /continue in demo mode/i }).click();
  await mobile.waitForURL(/\/app/);
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: `${OUT}/11-dashboard-mobile.png`, fullPage: false });
  console.log("wrote 11-dashboard-mobile.png");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
