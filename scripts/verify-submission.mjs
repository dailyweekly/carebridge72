import { spawnSync } from "node:child_process";
import path from "node:path";

const npmCli = process.platform === "win32"
  ? path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")
  : null;
const commands = [
  ["run", "test"],
  ["run", "lint"],
  ["run", "check:legal"],
  ["run", "check:copy"],
  ["run", "build"],
  ["audit"],
  ["run", "capture"],
  ["run", "check:captures"]
];

for (const args of commands) {
  const label = `npm ${args.join(" ")}`;
  console.log(`\n> ${label}`);
  const result = npmCli
    ? spawnSync(process.execPath, [npmCli, ...args], { stdio: "inherit", shell: false })
    : spawnSync("npm", args, { stdio: "inherit", shell: false });
  if (result.status !== 0) {
    console.error(`Submission verification failed at: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nSubmission verification passed.");
