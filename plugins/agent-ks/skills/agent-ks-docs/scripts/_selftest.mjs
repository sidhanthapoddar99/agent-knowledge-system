#!/usr/bin/env node
/**
 * Self-test / smoke harness for the agent-ks CLI toolkit (agent-ks plugin).
 *
 * Asserts the TARGET contract (Category 0) for every command, by invoking the
 * REPO `cli.mjs` directly — NOT the on-PATH `docs-*` bins, which resolve to the
 * cached plugin install and would not reflect repo edits.
 *
 * Contract checked per command:
 *   • `--help`  → exit 0, non-empty STDOUT
 *   • `--json`  → valid JSON on STDOUT (commands that take no required arg)
 *   • exit codes follow 0 ok / 1 err·no-match / 2 usage
 * Plus: the single `agent-ks` dispatcher + its `.cmd` twin exist; once `help`
 * exists, `help --json` lists every command.
 *
 * Baseline (pre-refactor) is EXPECTED to fail many checks — that is the point;
 * it measures the gap. As the contract subtasks land, checks turn green.
 *
 * Usage: node _selftest.mjs [--verbose]
 * Exit:  0 = all checks pass · 1 = one or more failed
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MANIFEST } from './_manifest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(HERE, 'cli.mjs');
const BIN_DIR = path.resolve(HERE, '../../../bin'); // plugin bin/ folder
const VERBOSE = process.argv.includes('--verbose');

// Match the shim runtime: prefer bun, fall back to node. The plugin ships NO
// node_modules; bun resolves deps (e.g. gray-matter) from its global cache,
// node cannot. Running under node would crash issues/* on import and produce a
// FALSE baseline — so detect bun the way bin/<name> does.
const RUNTIME = (() => {
  const probe = spawnSync('bun', ['--version'], { encoding: 'utf8' });
  return probe.status === 0 ? 'bun' : process.execPath;
})();

// Command registry is DERIVED from the manifest — the harness can never drift
// from the real command set. A command is `--json`-smoke-tested only if it
// declares a --json flag AND takes no required positional (list / review-queue);
// other --json commands need fixtures, tested elsewhere.
const NO_REQUIRED_ARG = new Set(['docs-list', 'docs-review-queue', 'docs-doc-list', 'docs-blog-list', 'docs-theme-tokens']);
const COMMANDS = MANIFEST.map((c) => ({
  name: c.bin,
  json: c.flags.some((f) => f.name === 'json') && NO_REQUIRED_ARG.has(c.bin),
}));

const results = [];
function record(name, check, ok, detail) {
  results.push({ name, check, ok, detail });
}

function run(args) {
  const r = spawnSync(RUNTIME, [CLI, ...args], { encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

for (const cmd of COMMANDS) {
  // --help contract: exit 0, non-empty stdout
  const h = run([cmd.name, '--help']);
  record(cmd.name, '--help exit 0', h.status === 0, `exit=${h.status}`);
  record(cmd.name, '--help stdout non-empty', h.stdout.trim().length > 0,
    `stdout=${h.stdout.trim().length}B stderr=${h.stderr.trim().length}B`);

  // -h short flag honored (same as --help)
  const hs = run([cmd.name, '-h']);
  record(cmd.name, '-h honored', hs.status === 0 && hs.stdout.trim().length > 0,
    `exit=${hs.status} stdout=${hs.stdout.trim().length}B`);

  // --json smoke for no-required-arg commands: must parse
  if (cmd.json) {
    const j = run([cmd.name, '--json']);
    let parsed = false;
    try { JSON.parse(j.stdout); parsed = true; } catch { /* fail */ }
    record(cmd.name, '--json parses', parsed, `exit=${j.status}`);
  }
}

// Single-entrypoint shim: the toolkit ships ONE dispatcher (`agent-ks`) plus its
// Windows twin — every command is reached as `agent-ks <group> <verb>`. (The flat
// `docs-*` names remain internal manifest ids / help lookups, not on-PATH shims.)
for (const shim of ['agent-ks', 'agent-ks.cmd']) {
  record('dispatcher', `${shim} exists`, fs.existsSync(path.join(BIN_DIR, shim)), path.join(BIN_DIR, shim));
}

// Discovery check (only meaningful once a help command exists)
const help = run(['docs-help', '--json']);
if (help.status !== 2) { // 2 == unknown command (not built yet)
  let names = [];
  try { const m = JSON.parse(help.stdout); names = (m.commands ?? m).map?.(c => c.bin ?? c.name ?? c) ?? []; } catch { /* */ }
  const everyListed = COMMANDS.every(c => names.includes(c.name));
  record('docs-help', 'lists every command', everyListed, `listed=${names.length}`);
}

// ---- report ----
const passed = results.filter(r => r.ok);
const failed = results.filter(r => !r.ok);
const byCmd = new Map();
for (const r of results) {
  if (!byCmd.has(r.name)) byCmd.set(r.name, []);
  byCmd.get(r.name).push(r);
}
console.log(`# CLI self-test — ${passed.length}/${results.length} checks passed  (runtime: ${RUNTIME === 'bun' ? 'bun' : 'node'})\n`);
for (const [name, checks] of byCmd) {
  const fails = checks.filter(c => !c.ok);
  const mark = fails.length === 0 ? '✓' : '✗';
  console.log(`${mark} ${name}  (${checks.length - fails.length}/${checks.length})`);
  if (VERBOSE || fails.length) {
    for (const c of checks) {
      if (!c.ok || VERBOSE) console.log(`    ${c.ok ? '·' : '✗'} ${c.check} — ${c.detail}`);
    }
  }
}
console.log(`\n${failed.length === 0 ? 'PASS' : `FAIL — ${failed.length} check(s) failed`}`);
process.exit(failed.length === 0 ? 0 : 1);
