import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const bin = path.join(root, "bin", "wallet-tracker.js");

test("node bin/wallet-tracker.js --version prints package.json version and exits 0", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const res = spawnSync(process.execPath, [bin, "--version"], { encoding: "utf8" });

  assert.equal(res.status, 0);
  assert.equal(res.stdout.trim(), `${pkg.name} ${pkg.version}`);
});
