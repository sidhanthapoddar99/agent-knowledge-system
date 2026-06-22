#!/usr/bin/env node
/**
 * Self-test / smoke harness for the documentation-guide CLI toolkit.
 *
 * Asserts the TARGET contract (Category 0) for every command, by invoking the
 * REPO `cli.mjs` directly — NOT the on-PATH `docs-*` bins, which resolve to the
 * cached plugin install and would not reflect repo edits.
 *
 * Contract checked per command:
 *   • `--help`  → exit 0, non-empty STDOUT
 *   • `--json`  → valid JSON on STDOUT (commands that take no required arg)
 *   • exit codes follow 0 ok / 1 err·no-match / 2 usage
 * Plus: every command has a `bin/<name>.cmd` Windows twin; once `help` exists,
 * `help --json` lists every command.
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

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(HERE, 'cli.mjs');
const BIN_DIR = path.resolve(HERE, '../../../bin'); // plugin bin/ folder
const VERBOSE = process.argv.includes('--verbose');

// Command registry for the harness. Once _manifest.mjs lands (subtask 03),
// switch this to import the manifest so the harness can never drift from reality.
// `json: true`  → safe to run `<cmd> --json` with no positional and parse it.
const COMMANDS = [
  { name: 'docs-list',          json: true  },
  { name: 'docs-show',          json: false },
  { name: 'docs-subtasks',      json: false },
  { name: 'docs-agent-logs',    json: false },
  { name: 'docs-set-state',     json: false },
  { name: 'docs-add-comment',   json: false },
  { name: 'docs-add-agent-log', json: false },
  { name: 'docs-review-queue',  json: true  },
  { name: 'docs-check-blog',    json: false },
  { name: 'docs-check-config',  json: false },
  { name: 'docs-check-section', json: false },
  { name: 'docs-move',          json: false },
  { name: 'docs-img',           json: false },
  // wired during the loop:
  // { name: 'docs-check-issues', json: false },
  // { name: 'docs-help',         json: true  },
];

const results = [];
function record(name, check, ok, detail) {
  results.push({ name, check, ok, detail });
}

function run(args) {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
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

  // Windows twin present
  const twin = path.join(BIN_DIR, `${cmd.name}.cmd`);
  record(cmd.name, '.cmd twin exists', fs.existsSync(twin), twin);
}

// Discovery check (only meaningful once a help command exists)
const help = run(['docs-help', '--json']);
if (help.status !== 2) { // 2 == unknown command (not built yet)
  let names = [];
  try { const m = JSON.parse(help.stdout); names = (m.commands ?? m).map?.(c => c.name ?? c) ?? []; } catch { /* */ }
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
console.log(`# CLI self-test — ${passed.length}/${results.length} checks passed\n`);
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
