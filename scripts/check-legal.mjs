import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
  const host = "127.0.0.1";
  let baseUrl = `http://${host}:3000`;
  let server;

  if (!(await isServerReady(`${baseUrl}/capture`))) {
    const port = 3102;
    baseUrl = `http://${host}:${port}`;
    const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
    server = spawn(process.execPath, [nextBin, "dev", "--hostname", host, "--port", String(port)], {
      cwd: root,
      stdio: "ignore",
      detached: false
    });
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
