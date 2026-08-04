#!/usr/bin/env bun
/**
 * reindex.mjs — regenerate `02_working/00_index.md` for an issue's agent logs.
 *
 * The round table is generated from the round files' frontmatter, and
 * `new-iteration` rewrites it whenever a round is opened. But a round's `status`
 * changes far more often than a round is created — `open` becomes `done` the
 * moment work lands — and without this verb the only way to bring the table back
 * into agreement would be to create an iteration nobody wanted.
 *
 * That is the difference between a gate people fix and a gate people learn to
 * ignore: `agent-ks check issues` reports a stale index as an error, and this is
 * the one-command answer it names.
 *
 * Idempotent. Reports what it changed, and exits 0 either way — nothing was
 * wrong if nothing moved.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, readIssueMeta, parseArgs, printHelp, relForLog,
  parseGroupSegments, MAX_SUBFOLDER_DEPTH,
} from './_lib.mjs';
import { renderWorkingIndex, WORKING_INDEX } from './_working-index.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id) {
  printHelp('issue reindex', [
    '<issue-id> [--log <path-under-agent-log>] [--check] [--json] [--tracker <path>]',
    '',
    "Regenerate 02_working/00_index.md — the round table — for every agent log on",
    'an issue, or just one with --log. Every cell is read from a round file\'s own',
    'frontmatter (title / unit / agent / status), so this never invents anything:',
    'correct the round file, then run this.',
    '',
    'Run it after changing a round\'s status. `agent-ks check issues` errors on an',
    'index that disagrees with its round files, and this is the fix it names.',
    '',
    '--log     limit to one agent log, path relative to agent-log/',
    '--check   report what WOULD change and exit 1 if anything is stale; write nothing',
    '--json    structured output',
  ]);
  process.exit(id ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);
if (!readIssueMeta(tracker, id)) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

const logRoot = path.join(tracker, id, 'agent-log');
const only = args.flags.log && args.flags.log !== true ? parseGroupSegments(String(args.flags.log)) : null;
const searchRoot = only ? path.join(logRoot, ...only) : logRoot;

if (!fs.existsSync(searchRoot)) {
  console.error(`No agent log at ${relForLog(searchRoot)}`);
  process.exit(1);
}

/** Every `02_working/` under the search root. Depth-capped like the loader. */
function findWorkingDirs(root, depth = 0) {
  const out = [];
  if (depth > MAX_SUBFOLDER_DEPTH) return out;
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const abs = path.join(root, e.name);
    if (e.name === '02_working') { out.push(abs); continue; }
    if (e.name === '03_debrief') continue;
    out.push(...findWorkingDirs(abs, depth + 1));
  }
  return out;
}

const CHECK = !!args.flags.check;
const changed = [];
const clean = [];

for (const dir of findWorkingDirs(searchRoot).sort()) {
  const abs = path.join(dir, WORKING_INDEX);
  const want = renderWorkingIndex(dir);
  const have = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf-8') : null;
  if (have === want) { clean.push(relForLog(abs)); continue; }
  changed.push({ path: relForLog(abs), created: have === null });
  if (!CHECK) fs.writeFileSync(abs, want);
}

if (args.flags.json) {
  console.log(JSON.stringify({ issue: id, mode: CHECK ? 'check' : 'write', changed, clean }, null, 2));
} else if (changed.length === 0) {
  console.log(`${clean.length} round table(s) already current under ${relForLog(searchRoot)}`);
} else {
  for (const c of changed) console.log(`  ${CHECK ? 'stale' : c.created ? 'created' : 'rewrote'} ${c.path}`);
  console.log(`${changed.length} ${CHECK ? 'stale' : 'rewritten'}, ${clean.length} already current`);
}

process.exit(CHECK && changed.length ? 1 : 0);
