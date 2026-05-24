import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextEnvPath = path.join(root, "next-env.d.ts");
const localHost = "localhost";
const rules = JSON.parse(fs.readFileSync(path.join(root, "data", "legal_safety_rules.json"), "utf8"));
const scannedDirs = ["app", "components", "lib", "data"];
const excludedFiles = new Set(["legal_safety_rules.json"]);
const textExtensions = new Set([".ts", ".tsx", ".json", ".css"]);
const findings = [];

for (const dir of scannedDirs) {
  walk(path.join(root, dir));
}

await scanRuntimeOutputs();

if (findings.length > 0) {
  console.error("Legal safety check failed.");
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.snippet} (${finding.pattern})`);
  }
  process.exit(1);
}

console.log("Legal safety check passed.");

function walk(current) {
  const stat = fs.statSync(current);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(current)) {
      walk(path.join(current, entry));
    }
    return;
  }

  if (!textExtensions.has(path.extname(current)) || excludedFiles.has(path.basename(current))) {
    return;
  }

  const text = fs.readFileSync(current, "utf8");
  for (const rule of rules) {
    const regexp = new RegExp(rule.pattern, "giu");
    for (const match of text.matchAll(regexp)) {
      findings.push({
        file: path.relative(root, current),
        pattern: rule.pattern,
        snippet: match[0]
      });
    }
  }
}

async function scanRuntimeOutputs() {
  const reusableBaseUrl = process.env.LEGAL_CHECK_BASE_URL;
  const originalNextEnv = readOptionalFile(nextEnvPath);
  let baseUrl = reusableBaseUrl ?? (await findReusableBaseUrl()) ?? `http://${localHost}:3102`;
  let server;

  if (!reusableBaseUrl && !baseUrl.endsWith(":3108") && !baseUrl.endsWith(":3000")) {
    const port = 3102;
    const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
    server = spawn(process.execPath, [nextBin, "dev", "--hostname", localHost, "--port", String(port)], {
      cwd: root,
      stdio: "ignore",
      detached: false
    });
  } else if (!(await isServerReady(`${baseUrl}/capture`))) {
    throw new Error(`LEGAL_CHECK_BASE_URL is not ready: ${baseUrl}`);
  }

  try {
    await waitForServer(`${baseUrl}/capture`, 30000);
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

    for (const route of ["/", "/capture", "/demo"]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      const text = await page.locator("body").innerText();
      scanText(text, `rendered:${route}`);
    }

    const patient = JSON.parse(fs.readFileSync(path.join(root, "data", "patients.mock.json"), "utf8"))
      .find((item) => item.id === "P003");
    const risk = await postJson(`${baseUrl}/api/risk`, { patient });
    const resources = await postJson(`${baseUrl}/api/resources`, { patient });
    const guide = await postJson(`${baseUrl}/api/guide`, {
      patient,
      risk,
      candidates: resources.candidates,
      lang: "en"
    });

    scanText(JSON.stringify({ risk, resources, guide }), "api:scenario-P003");
    await browser.close();
  } finally {
    server?.kill();
    restoreFileIfChanged(nextEnvPath, originalNextEnv);
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

async function findReusableBaseUrl() {
  for (const candidate of [`http://${localHost}:3108`, `http://${localHost}:3000`]) {
    if (await isCareBridgeServer(candidate)) return candidate;
  }
  return null;
}

async function isCareBridgeServer(baseUrl) {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) return false;
    const text = await response.text();
    return text.includes("CareBridge72") && (await isServerReady(`${baseUrl}/capture`));
  } catch {
    return false;
  }
}

function scanText(text, file) {
  for (const rule of rules) {
    const regexp = new RegExp(rule.pattern, "giu");
    for (const match of text.matchAll(regexp)) {
      findings.push({
        file,
        pattern: rule.pattern,
        snippet: match[0]
      });
    }
  }
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
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

async function isServerReady(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}
