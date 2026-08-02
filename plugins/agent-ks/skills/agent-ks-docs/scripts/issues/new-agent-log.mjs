#!/usr/bin/env bun
/**
 * new-agent-log.mjs — scaffold a new AGENT LOG folder for an issue.
 *
 * An agent log is `agent-log/[<group>/]NNN_<code>_<name>/` — one run, one goal.
 * It is created with exactly two files:
 *
 *   settings.json   {"status": "open"} — the run's status, which colours its
 *                   kind symbol in the sidebar
 *   summary.md      the one conclusive file: State · Goal and Trigger ·
 *                   Task List · Out of Scope · Outcome Summary
 *
 * **No other slot is seeded, and that is deliberate.** The previous version of
 * this script created six files whether or not the run had anything to put in
 * them, which is how a one-line change acquired a three-file floor. `working/`
 * appears when the first iteration file is written (`agent-ks issue
 * new-iteration`); `debrief/` appears when the run has something to hand over.
 *
 * `summary.md` IS the brief: point an agent at it and spend the prompt on the
 * delta, rather than committing a separate brief file per run.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad,
  parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
  parseGroupSegments, sanitizeName,
} from './_lib.mjs';

// Framework-default kinds (mirror of src/loaders/issues.ts). An issue may add
// custom codes via settings.json → agentLogKinds; unknown codes degrade
// gracefully (render without a symbol), so we warn rather than block.
const DEFAULT_KINDS = { lp: 'loop', au: 'audit', rf: 'refactor', it: 'iteration', wf: 'workflow' };

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const kind = args.flags.kind && args.flags.kind !== true ? String(args.flags.kind) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !kind || !rawName) {
  printHelp('issue new-agent-log', [
    '<issue-id> --kind <code> --name <slug> [--group <a[/b]>] [--prefix <NNN>] [--goal <text>] [--parent <path>] [--json] [--tracker <path>]',
    '',
    'Scaffold an agent log at agent-log/[<group>/]NNN_<code>_<name>/ with settings.json',
    '({"status": "open"}) and summary.md (State / Goal and Trigger / Task List /',
    'Out of Scope / Outcome Summary). Nothing else is seeded: working/ appears with',
    'the first iteration file (issue new-iteration), debrief/ when the run has',
    'something to hand over.',
    '',
    `--kind    agent-log kind code (defaults: ${Object.keys(DEFAULT_KINDS).join('/')}; custom via settings.json agentLogKinds)`,
    '--name    kebab-case run name (sanitised to [a-z0-9-])',
    '--group   nest under a grouping folder path (created if missing; `_` preserved;',
    '          numbering is scoped to the group folder)',
    '--parent  create this as a CHILD agent log inside an existing one — pass the',
    '          parent folder path relative to agent-log/ (e.g. 030_lp_overnight).',
    '          Use when the sub-goal has a goal of its OWN; work done toward the',
    '          parent\'s goal is an iteration file, not a child log',
    '--prefix  explicit number (digits, e.g. 013) instead of the next gap-spaced one',
    '--goal    text to seed the Goal and Trigger section',
    '--json    print the created folder + files as JSON',
  ]);
  process.exit(id && kind && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

// Issue must exist.
const meta = readIssueMeta(tracker, id);
if (!meta) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

// Validate the kind against the effective set (defaults + this issue's custom
// codes). Unknown is a warning, not an error — it still renders, just symbol-less.
const customKinds = meta.agentLogKinds && typeof meta.agentLogKinds === 'object' ? Object.keys(meta.agentLogKinds) : [];
const effective = new Set([...Object.keys(DEFAULT_KINDS), ...customKinds]);
if (!effective.has(kind)) {
  console.error(`warning: kind "${kind}" is not in this issue's effective set (${[...effective].sort().join('/')}) — it will render without a symbol. Declare it in settings.json agentLogKinds to give it one.`);
}

const name = sanitizeName(rawName);
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

// Grouping folders and `--parent` both nest below agent-log/; they differ only
// in meaning (a label vs. a real parent run), so they compose into one path.
const groupRaw = args.flags.group && args.flags.group !== true ? String(args.flags.group) : '';
const parentRaw = args.flags.parent && args.flags.parent !== true ? String(args.flags.parent) : '';
const groupSegments = [...parseGroupSegments(groupRaw), ...parseGroupSegments(parentRaw)];

if (groupSegments.length >= MAX_SUBFOLDER_DEPTH) {
  console.error(
    `--group/--parent nests ${groupSegments.length} folder levels; the loader ` +
    `reads at most ${MAX_SUBFOLDER_DEPTH - 1} levels below agent-log/ ` +
    `(depth cap ${MAX_SUBFOLDER_DEPTH}). Two levels of child agent log is the ` +
    `working ceiling — deeper is a sign the nesting is encoding WHEN work happened ` +
    `rather than WHAT it was for.`
  );
  process.exit(1);
}

if (parentRaw) {
  const parentDir = path.join(tracker, id, 'agent-log', ...parseGroupSegments(groupRaw), ...parseGroupSegments(parentRaw));
  if (!fs.existsSync(parentDir)) {
    console.error(`--parent "${parentRaw}" does not exist under ${relForLog(path.join(tracker, id, 'agent-log'))}/`);
    process.exit(1);
  }
}

// Optional explicit prefix — for series that number sequentially (001, 002, …)
// rather than gap-spaced; digits only, used verbatim (zero-padding preserved).
const prefixRaw = args.flags.prefix && args.flags.prefix !== true ? String(args.flags.prefix) : '';
if (prefixRaw && !/^\d{2,5}$/.test(prefixRaw)) {
  console.error(`--prefix "${prefixRaw}" must be 2–5 digits (e.g. 013).`);
  process.exit(1);
}

const baseDir = path.join(tracker, id, 'agent-log', ...groupSegments);

// Next prefix — gap-spaced by 10 (010, 020, …) to leave insert room. Scans
// DIRECTORIES only: `working/` and `debrief/` are reserved names, not runs.
const RESERVED = new Set(['working', 'debrief']);
function nextActivityPrefix(dir) {
  let max = 0;
  if (fs.existsSync(dir)) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || RESERVED.has(e.name)) continue;
      const m = e.name.match(/^(\d+)[_-]/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max === 0 ? 10 : max + 10;
}

const prefix = prefixRaw || pad(nextActivityPrefix(baseDir));
const folderName = `${prefix}_${kind}_${name}`;
const dir = path.join(baseDir, folderName);

if (!isInsideAllowed(dir, tracker)) {
  console.error(`Refusing to write outside the tracker: ${dir}`);
  process.exit(1);
}
if (fs.existsSync(dir)) {
  console.error(`Agent log already exists: ${relForLog(dir)}`);
  process.exit(1);
}

const goalBody = args.flags.goal && args.flags.goal !== true
  ? `${String(args.flags.goal).trim()}\n`
  : `> [!NOTE]\n> Fill this in. What this run is for, in plain language, plus the trigger when\n> it is not obvious. Written once — it does not change as the run proceeds.\n`;

const summary = `---
title: "Summary"
---

# State

> [!NOTE]
> Where this run is RIGHT NOW and what happens next, in a few lines. The only
> section rewritten during the run. Not a status token — that lives in
> \`settings.json\`.

# Goal and Trigger

${goalBody}
# Task List

> [!NOTE]
> This run's checklist, headed by its references — the plan stage and subtask it
> executes against, plus the notes that scope it. References live here because
> they are what the tasks execute against. Run-local and disposable: an item
> that outlives the run becomes a subtask.

# Out of Scope

> [!NOTE]
> What this run deliberately does not touch. Written once.

# Outcome Summary

> [!IMPORTANT]
> **One sentence and a link.** Never a paragraph — this is the seam most likely
> to regrow the whole story, and the iteration files already hold it.
`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'settings.json'), `{\n  "status": "open"\n}\n`);
fs.writeFileSync(path.join(dir, 'summary.md'), summary);
const written = ['settings.json', 'summary.md'];

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id,
    folder: folderName,
    path: relForLog(dir),
    group: groupSegments.join('/') || null,
    files: written,
  }, null, 2));
} else {
  console.log(`Created ${relForLog(dir)}/ — ${written.join(' ')}`);
  console.log(`  next: agent-ks issue new-iteration ${id} --log ${[...groupSegments, folderName].join('/')} --name <round>`);
}
