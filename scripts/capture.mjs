import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const captureDir = path.join(root, "captures");
const nextEnvPath = path.join(root, "next-env.d.ts");
const host = "localhost";
const port = 3101;
const spawnedBaseUrl = `http://${host}:${port}`;
const reusableBaseUrl = process.env.CAPTURE_BASE_URL;
const workspaceAccessCode = process.env.WORKSPACE_ACCESS_CODE || "7272";
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

await fs.mkdir(captureDir, { recursive: true });
const originalNextEnv = await readOptionalFile(nextEnvPath);

const detectedBaseUrl = await findReusableBaseUrl(reusableBaseUrl);
const shouldReuseServer = Boolean(detectedBaseUrl);
const baseUrl = detectedBaseUrl ?? spawnedBaseUrl;
const server = shouldReuseServer
  ? null
  : spawn(process.execPath, [nextBin, "dev", "--hostname", host, "--port", String(port)], {
      cwd: root,
      stdio: "ignore",
      detached: false
    });

try {
  await waitForServer(`${baseUrl}/capture`, 30000);
  const browser = await chromium.launch({ headless: true });

  const workspacePage = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await workspacePage.goto(`${baseUrl}/workspace`, { waitUntil: "networkidle" });
  await enterWorkspace(workspacePage, workspaceAccessCode);
  await hideDevChrome(workspacePage);
  await waitForWorkspaceData(workspacePage);
  await workspacePage.screenshot({ path: path.join(captureDir, "06-workspace.png"), fullPage: false });
  await workspacePage.locator("text=병원 사회사업실 기준정보").scrollIntoViewIfNeeded();
  await workspacePage.screenshot({ path: path.join(captureDir, "07-hospital-reference.png"), fullPage: false });
  await workspacePage.close();

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 1 });
  await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
  await hideDevChrome(mobilePage);
  await mobilePage.screenshot({ path: path.join(captureDir, "08-mobile.png"), fullPage: false });
  await mobilePage.close();

  const statusPage = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await statusPage.goto(`${baseUrl}/status`, { waitUntil: "networkidle" });
  await hideDevChrome(statusPage);
  await statusPage.screenshot({ path: path.join(captureDir, "09-status.png"), fullPage: false });
  await statusPage.close();

  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await hideDevChrome(page);
  await page.selectOption("select[name='caseSelection']", "P003");
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
  await restoreFileIfChanged(nextEnvPath, originalNextEnv);
}

async function isServerReady(url, timeoutMs) {
  try {
    await waitForServer(url, timeoutMs);
    return true;
  } catch {
    return false;
  }
}

async function readOptionalFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function restoreFileIfChanged(filePath, originalContent) {
  if (originalContent === null) return;
  const currentContent = await readOptionalFile(filePath);
  if (currentContent !== originalContent) {
    await fs.writeFile(filePath, originalContent);
  }
}

async function findReusableBaseUrl(explicitBaseUrl) {
  if (explicitBaseUrl && (await isServerReady(`${explicitBaseUrl}/capture`, 2000))) {
    return explicitBaseUrl;
  }

  for (const candidate of [`http://${host}:3108`, `http://${host}:3000`]) {
    if (await isCareBridgeServer(candidate)) return candidate;
  }

  return null;
}

async function isCareBridgeServer(baseUrl) {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) return false;
    const text = await response.text();
    if (!text.includes("CareBridge72")) return false;
    return isServerReady(`${baseUrl}/capture`, 2000);
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

async function enterWorkspace(page, accessCode) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.waitForSelector("input[type='password']", { state: "visible" });
    await page.click("input[type='password']");
    await page.keyboard.type(accessCode);
    await page.click("button:has-text('입장')");

    try {
      await page.locator("h1:has-text('담당자 인계와 가족 안내 초안')").waitFor({ state: "visible", timeout: 10000 });
      await page.waitForTimeout(5000);
      return;
    } catch {
      if (attempt === 2) throw new Error("Workspace access did not complete.");
      await page.reload({ waitUntil: "networkidle" });
      await hideDevChrome(page);
    }
  }
}

async function waitForWorkspaceData(page) {
  await Promise.allSettled([
    page
      .locator("text=/공공데이터 반영|예비 후보|기본 후보 정보로 표시/")
      .first()
      .waitFor({ state: "visible", timeout: 20000 }),
    page
      .locator("text=/공공데이터 반영|연결됨 · 지역 결과 없음|API 키 미설정|승인 또는 키 확인 필요|응답 지연/")
      .first()
      .waitFor({ state: "visible", timeout: 60000 })
  ]);
}
