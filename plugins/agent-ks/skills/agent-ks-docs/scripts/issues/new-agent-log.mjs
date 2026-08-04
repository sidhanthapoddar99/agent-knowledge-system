#!/usr/bin/env bun
/**
 * new-agent-log.mjs — scaffold a new AGENT LOG folder for an issue.
 *
 * An agent log is `agent-log/[<group>/]NNN_<code>_<name>/` — one run, one goal.
 * It is created with exactly two files:
 *
 *   settings.json   {"status": "open"} — the run's status, which colours its
 *                   kind symbol in the sidebar
 *   01_summary.md   the one conclusive file: State · Goal · Todo ·
 *                   Out of Scope (optional) · Outcome
 *
 * plus `02_working/00_index.md` — an EMPTY STUB for the run's round index, which
 * the orchestrator writes by hand as rounds land. It is seeded because the
 * alternative was invisible structure: a fresh log showed one file, so an agent
 * could not tell that two thirds of the shape existed, and wrote everything into
 * the summary. It has to be a file rather than a bare folder because git does
 * not track empty directories.
 *
 * **The index is written, not generated, and that is a decision rather than an
 * omission.** A generated table can only restate frontmatter; the useful index
 * carries a line of what each round FOUND, which no generator can write. An
 * earlier version of this script generated it — and the generator and its
 * staleness checker shared a blind spot, so a round stored as a folder was
 * dropped from the table and the checker certified the result. Keeping an index
 * honest is a reading job: `/agent-ks-index-check`.
 *
 * **`03_debrief/` is still not seeded, and that is deliberate.** The previous
 * version of this script created six files whether or not the run had anything
 * to put in them, which is how a one-line change acquired a three-file floor.
 * Every run that works has a round; only some produce a handover, so that slot
 * gets a line in the printed hint instead of an empty section on every log.
 *
 * **The slots are numbered `01`–`03` and child activities start at 100.** That
 * is the whole grammar: a folder inside an activity is one of its own slots when
 * the prefix is under 100 and a child run at 100 or above, so the read order is
 * stated in the filename and the slot/child question is arithmetic.
 *
 * `01_summary.md` IS the brief: point an agent at it and spend the prompt on the
 * delta, rather than committing a separate brief file per run.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad,
  parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
  parseGroupSegments, sanitizeName,
} from './_lib.mjs';
import { WORKING_INDEX, workingIndexStub } from './_index-stub.mjs';

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
    'DOES THIS RUN EARN A LOG? A log exists so a finding can be withdrawn, so the',
    'question is: is there something here the finished work does not show?',
    '  TRIGGER, any one — a later step changed course because of what an earlier one',
    '  RETURNED (executing a plan always does) · something was tried and DISCARDED ·',
    '  the user asked.',
    '  FLOOR, any one, and it WINS — the log would restate the subtask · one',
    '  self-contained pass with nothing discarded.',
    'Never file count, never time spent. A verify (did I break it) is not a stage.',
    'And if a run is already OPEN, append to it — never open a second.',
    '',
    'Scaffold an agent log at agent-log/[<group>/]NNN_<code>_<name>/ with settings.json',
    '({"status": "open"}), 01_summary.md (State / Goal / Todo / Out of Scope /',
    'Outcome) and 02_working/00_index.md — an empty round index you WRITE as rounds',
    'land, one line each of what the round found. 03_debrief/ is NOT',
    'seeded: open it by hand when the run has something to hand over (handover,',
    'questions, findings, caveats). A CHILD log (--parent) is numbered from 100 up,',
    'which is what distinguishes it from the parent\'s own 01-03 slots.',
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
    '--goal    text to seed the Goal section',
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

// Next prefix — gap-spaced by 10 to leave insert room. Scans DIRECTORIES only,
// and skips anything below CHILD_MIN_PREFIX: those are the run's own slots
// (`02_working/`, `03_debrief/`), not runs. Prefix, not name — which is why a
// child activity may now be *called* whatever it likes.
const CHILD_MIN_PREFIX = 100;
function nextActivityPrefix(dir, floor) {
  let max = 0;
  if (fs.existsSync(dir)) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const m = e.name.match(/^(\d+)[_-]/);
      if (!m) continue;
      const n = parseInt(m[1], 10);
      if (n < floor) continue;
      max = Math.max(max, n);
    }
  }
  return max === 0 ? floor : max + 10;
}

// A CHILD activity starts at 100: below that is the parent's own slot band, and
// a child numbered `04_` would sort into the middle of them.
const floor = parentRaw ? CHILD_MIN_PREFIX : 10;
const prefix = prefixRaw || pad(nextActivityPrefix(baseDir, floor));

if (parentRaw && !prefixRaw && parseInt(prefix, 10) < CHILD_MIN_PREFIX) {
  console.error(`Refusing to number a child agent log below ${CHILD_MIN_PREFIX}: that band belongs to the parent's own slots.`);
  process.exit(1);
}
if (parentRaw && prefixRaw && parseInt(prefixRaw, 10) < CHILD_MIN_PREFIX) {
  console.error(
    `--prefix "${prefixRaw}" is below ${CHILD_MIN_PREFIX}, which is the parent's slot band ` +
    `(01_summary.md / 02_working/ / 03_debrief/). A child agent log is NXX_<code>_<name>/ ` +
    `with a prefix of ${CHILD_MIN_PREFIX} or more.`,
  );
  process.exit(1);
}
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
  : `> [!NOTE]\n> Fill this in. What this run is for, in plain language, plus the trigger — who\n> asked, when, in what words. Written once; it does not change as the run\n> proceeds.\n`;

const summary = `---
title: "Summary"
---

# State

> [!NOTE]
> Where this run is RIGHT NOW and what happens next, in a few lines. The only
> section rewritten during the run. Not a status token — that lives in
> \`settings.json\`.

# Goal

${goalBody}
# Todo

> [!NOTE]
> This run's checklist, headed by its references — the plan stage and subtask it
> executes against, plus the notes that scope it. References live here because
> they are what the tasks execute against. Run-local and disposable: an item
> that outlives the run becomes a subtask.
>
> **Every item is a markdown LINK, never a bare number**, and carries a line of
> what it actually did — a checklist of titles is an index, not a summary:
>
> \`- [x] [The plans section](../../subtasks/010_plans.md) — framework, CLI and
> validator; four new scaffolders\`

# Out of Scope

> [!NOTE]
> What this run deliberately does not touch. Written once. **Optional** — delete
> this section rather than writing "nothing".

# Outcome

> [!NOTE]
> What the run produced, what it cost, what it found, and which gates it passed,
> with numbers. **A detail area** — as long as the run warrants. The one rule is
> *point at detail rather than copying it*: link the iteration file that holds
> the working instead of re-narrating it.
`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'settings.json'), `{\n  "status": "open"\n}\n`);
fs.writeFileSync(path.join(dir, '01_summary.md'), summary);
fs.mkdirSync(path.join(dir, '02_working'), { recursive: true });
fs.writeFileSync(path.join(dir, '02_working', WORKING_INDEX), workingIndexStub());
const written = ['settings.json', '01_summary.md', `02_working/${WORKING_INDEX}`];

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
