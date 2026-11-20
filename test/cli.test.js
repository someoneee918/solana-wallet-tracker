import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const bin = path.join(root, "bin", "wallet-tracker.js");
const validAddr = "So11111111111111111111111111111111111111112";

function run(args) {
  return spawnSync(process.execPath, [bin, ...args], { encoding: "utf8" });
}

test("rejects non-numeric --history with clear message and exit code 1", () => {
  const r1 = run([validAddr, "--history", "abc"]);
  assert.equal(r1.status, 1);
  assert.match(r1.stderr, /--history must be a number from 0 to 20/);

  const r2 = run([validAddr, "--history", "50"]);
  assert.equal(r2.status, 1);
  assert.match(r2.stderr, /--history must be a number from 0 to 20/);

  const r3 = run([validAddr, "--history", "-1"]);
  assert.equal(r3.status, 1);
  assert.match(r3.stderr, /--history must be a number from 0 to 20/);

  const r4 = run([validAddr, "--history"]);
  assert.equal(r4.status, 1);
  assert.match(r4.stderr, /--history must be a number from 0 to 20/);
});

test("rejects invalid --interval with clear message and exit code 1", () => {
  const r1 = run([validAddr, "--interval", "abc"]);
  assert.equal(r1.status, 1);
  assert.match(r1.stderr, /--interval must be a number of 10 or more/);

  const r2 = run([validAddr, "--interval", "5"]);
  assert.equal(r2.status, 1);
  assert.match(r2.stderr, /--interval must be a number of 10 or more/);

  const r3 = run([validAddr, "--interval"]);
  assert.equal(r3.status, 1);
  assert.match(r3.stderr, /--interval must be a number of 10 or more/);
});

test("rejects invalid --min-sol with clear message and exit code 1", () => {
  const r1 = run([validAddr, "--min-sol", "abc"]);
  assert.equal(r1.status, 1);
  assert.match(r1.stderr, /--min-sol must be a number of 0 or more/);

  const r2 = run([validAddr, "--min-sol", "-1"]);
  assert.equal(r2.status, 1);
  assert.match(r2.stderr, /--min-sol must be a number of 0 or more/);

  const r3 = run([validAddr, "--min-sol"]);
  assert.equal(r3.status, 1);
  assert.match(r3.stderr, /--min-sol must be a number of 0 or more/);
});
