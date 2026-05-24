import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextEnvPath = path.join(root, "next-env.d.ts");
const host = "localhost";
const port = 3103;
const spawnedBaseUrl = `http://${host}:${port}`;
const workspaceAccessCode = process.env.WORKSPACE_ACCESS_CODE || "7272";

const bannedCopy = [
  { pattern: /가명\s*데이터/g, replacement: "시연용 사례" },
  { pattern: /가명\s*사례/g, replacement: "시연용 사례" },
  { pattern: /가명\s*환자/g, replacement: "시연용 사례" },
  { pattern: /프리셋/g, replacement: "사례 선택" },
  { pattern: /SaaS/gi, replacement: "업무 보조 서비스" },
  { pattern: /KPI\s*대시보드/gi, replacement: "관리자용 분석 기능" },
  { pattern: /fallback/gi, replacement: "기본 초안" },
  { pattern: /mock/gi, replacement: "시연용" },
  { pattern: /JSON\s*운영\s*상태\s*API/gi, replacement: "운영 상태 원문" },
  { pattern: /공공\s*API/g, replacement: "공공데이터" },
  { pattern: /NHIS\s*API/gi, replacement: "공공데이터" },
  { pattern: /API\s*키/g, replacement: "운영 설정" },
  { pattern: /환경변수/g, replacement: "운영 설정" },
  { pattern: /비밀\s*키/g, replacement: "비밀 설정값" },
  { pattern: /안전선/g, replacement: "운영 원칙" }
];

const routes = ["/", "/capture", "/demo", "/readiness", "/status", "/workspace"];
const findings = [];
const originalNextEnv = readOptionalFile(nextEnvPath);
const explicitBaseUrl = process.env.COPY_CHECK_BASE_URL;
const detectedBaseUrl = await findReusableBaseUrl(explicitBaseUrl);
const shouldReuseServer = Boolean(detectedBaseUrl);
const baseUrl = detectedBaseUrl ?? spawnedBaseUrl;
const server = shouldReuseServer ? null : spawnNextServer();

try {
  await waitForServer(`${baseUrl}/capture`, 30000);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await hideDevChrome(page);
    scanText(await page.locator("body").innerText(), route);

    if (route === "/workspace") {
      await enterWorkspace(page, workspaceAccessCode);
      scanText(await page.locator("body").innerText(), `${route}:unlocked`);
    }
  }

  await browser.close();
} finally {
  server?.kill();
  restoreFileIfChanged(nextEnvPath, originalNextEnv);
}

if (findings.length > 0) {
  console.error("User-facing copy check failed.");
  for (const finding of findings) {
    console.error(`- ${finding.route}: "${finding.match}" -> use "${finding.replacement}"`);
  }
  process.exit(1);
}

console.log(`User-facing copy check passed (${routes.length + 1} views scanned).`);

function spawnNextServer() {
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  return spawn(process.execPath, [nextBin, "dev", "--hostname", host, "--port", String(port)], {
    cwd: root,
    stdio: "ignore",
    detached: false
  });
}

function scanText(text, route) {
  for (const rule of bannedCopy) {
    for (const match of text.matchAll(rule.pattern)) {
      findings.push({
        route,
        match: match[0],
        replacement: rule.replacement
      });
    }
  }
}

async function enterWorkspace(page, accessCode) {
  await page.waitForSelector("input[type='password']", { state: "visible", timeout: 10000 });
  await page.fill("input[type='password']", accessCode);
  await page.click("button:has-text('입장')");
  await page.locator("h1:has-text('담당자 인계와 가족 안내 초안')").waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(1000);
}

async function hideDevChrome(page) {
  await page.addStyleTag({
    content: "nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay] { display: none !important; }"
  });
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
    return text.includes("CareBridge72") && (await isServerReady(`${baseUrl}/capture`, 2000));
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerReady(url, 1000)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function isServerReady(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function readOptionalFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function restoreFileIfChanged(filePath, originalContent) {
  if (originalContent === null) return;
  const currentContent = readOptionalFile(filePath);
  if (currentContent !== originalContent) {
    fs.writeFileSync(filePath, originalContent);
  }
}
