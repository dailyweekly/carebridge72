import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const captureDir = path.join(root, "captures");
const host = "127.0.0.1";
const port = 3101;
const spawnedBaseUrl = `http://${host}:${port}`;
const reusableBaseUrl = process.env.CAPTURE_BASE_URL;
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

await fs.mkdir(captureDir, { recursive: true });

const shouldReuseServer = reusableBaseUrl ? await isServerReady(`${reusableBaseUrl}/capture`, 2000) : false;
const baseUrl = shouldReuseServer && reusableBaseUrl ? reusableBaseUrl : spawnedBaseUrl;
const server = shouldReuseServer
  ? null
  : spawn(process.execPath, [nextBin, "dev", "--hostname", host, "--port", String(port)], {
      cwd: root,
      stdio: "ignore",
      detached: false
    });

try {
  await waitForServer(`${baseUrl}/capture`, 30000);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await hideDevChrome(page);
  await page.selectOption("select[name='patientPreset']", "P003");
  await page.screenshot({ path: path.join(captureDir, "01-input.png"), fullPage: false });

  await page.goto(`${baseUrl}/capture`, { waitUntil: "networkidle" });
  await hideDevChrome(page);
  await screenshotSection(page, "#risk", path.join(captureDir, "02-risk.png"));
  await screenshotSection(page, "#candidates", path.join(captureDir, "03-candidates.png"));
  await screenshotSection(page, "#guide", path.join(captureDir, "04-guide.png"));
  await page.goto(`${baseUrl}/capture`, { waitUntil: "networkidle" });
  await hideDevChrome(page);
  await page.screenshot({ path: path.join(captureDir, "05-full.png"), fullPage: true });

  await browser.close();
  console.log("Capture files written to captures/.");
} finally {
  server?.kill();
}

async function isServerReady(url, timeoutMs) {
  try {
    await waitForServer(url, timeoutMs);
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function screenshotSection(page, selector, outputPath) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -96));
  await page.screenshot({ path: outputPath, fullPage: false });
}

async function hideDevChrome(page) {
  await page.addStyleTag({
    content: "nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay] { display: none !important; }"
  });
}
