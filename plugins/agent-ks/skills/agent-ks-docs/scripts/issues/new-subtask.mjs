#!/usr/bin/env bun
/**
 * new-subtask.mjs — scaffold a new SUBTASK file for an issue, pre-seeded with
 * the standard five-section template.
 *
 * Distinct from set-state (which flips an existing subtask): this creates
 * `subtasks/[<group>/]NN_<name>.md` with the uniform section skeleton so every
 * subtask starts from the same shape with no guesswork:
 *
 *   # Overview                 — brief: what this subtask is, why it exists
 *   # References               — links: notes, agent-logs, brainstorms it rests on
 *   # Todo list                — the checklist (nested checkboxes welcome)
 *   # Outcomes and Next Steps  — PLACEHOLDER, filled at completion / hand-off
 *   # Details                  — the large, detailed spec content (inline, not
 *                                a separate note — one level, one home)
 *
 * The Outcomes placeholder carries the literal marker `PLACEHOLDER` so
 * `agent-ks check issues` (with the subtask-template lint on) can flag a
 * review/done subtask whose outcomes were never written.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad,
  parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !rawName) {
  printHelp('issue new-subtask', [
    '<issue-id> --name <slug> [--title <text>] [--group <a[/b]>] [--overview <text>] [--json] [--tracker <path>]',
    '',
    'Scaffold a new subtask file subtasks/[<group>/]NN_<name>.md pre-seeded with the',
    'standard five-section template (Overview / References / Todo list / Outcomes and',
    'Next Steps / Details). The prefix is the next gap-spaced number in the target',
    'folder. Outcomes ships as a PLACEHOLDER callout the template lint can track.',
    '',
    '--name      kebab-case subtask name (sanitised to [a-z0-9-]) — required',
    '--title     frontmatter title (default: name, de-kebabed and capitalised)',
    '--group     nest under a grouping folder path (created if missing; label only;',
    '            segments sanitised to [a-z0-9-]; max 4 levels — loader depth cap)',
    '--overview  seed the Overview section with this text instead of its callout',
    '--json      print the created file as JSON',
  ]);
  process.exit(id && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

// Issue must exist.
const meta = readIssueMeta(tracker, id);
if (!meta) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

// Sanitise the name to the tracker's slug grammar.
const name = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

// Optional grouping folders — labels only, sanitised segment by segment.
const groupRaw = args.flags.group && args.flags.group !== true ? String(args.flags.group) : '';
const groupSegments = groupRaw
  .split('/')
  .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
  .filter(Boolean);

if (groupSegments.length >= MAX_SUBFOLDER_DEPTH) {
  console.error(
    `--group "${groupRaw}" nests ${groupSegments.length} folder levels; the loader ` +
    `reads at most ${MAX_SUBFOLDER_DEPTH - 1} grouping levels below subtasks/ ` +
    `(depth cap ${MAX_SUBFOLDER_DEPTH}). Flatten the grouping.`
  );
  process.exit(1);
}

const title = args.flags.title && args.flags.title !== true
  ? String(args.flags.title)
  : name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

const baseDir = path.join(tracker, id, 'subtasks', ...groupSegments);

// Next prefix — gap-spaced by 10, scanning FILES and FOLDERS interleaved
// (they share the numbering at each level per the subtask grammar).
function nextPrefix(dir) {
  let max = 0;
  if (fs.existsSync(dir)) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const m = e.name.match(/^(\d+)[_-]/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max === 0 ? 10 : max + 10;
}

const prefix = pad(nextPrefix(baseDir));
const fileName = `${prefix}_${name}.md`;
const abs = path.join(baseDir, fileName);

if (!isInsideAllowed(abs, tracker)) {
  console.error(`Refusing to write outside the tracker: ${abs}`);
  process.exit(1);
}
if (fs.existsSync(abs)) {
  console.error(`Subtask file already exists: ${relForLog(abs)}`);
  process.exit(1);
}

const overviewBody = args.flags.overview && args.flags.overview !== true
  ? `${String(args.flags.overview).trim()}\n`
  : `> [!NOTE]\n> Blank — a brief overview: what this subtask is, what triggered it, and what\n> "done" looks like. Keep it short; the full spec lives in **Details** below.\n`;

const body = `---
title: "${title}"
status: open
---

# Overview

${overviewBody}
# References

> [!NOTE]
> Blank — the material this work rests on: related \`notes/\`, the agent-log
> activity executing it, and the \`brainstorm/\` threads it resolved from.
> Spell out full paths; shorthand rots when files move.

# Todo list

- [ ] ...
  - [ ] ...
  - [ ] ...
- [ ] ...

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching \`review\` with this marker still in
> place is flagged by the template lint.

# Details

> [!NOTE]
> Blank — the large, detailed content: the full spec, design reasoning, scope
> rulings, and anything a cold reader needs to execute. This section replaces a
> separate per-subtask note — one level, one home.
`;

fs.mkdirSync(baseDir, { recursive: true });
fs.writeFileSync(abs, body);

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id,
    file: fileName,
    path: relForLog(abs),
    group: groupSegments.join('/') || null,
    title,
  }, null, 2));
} else {
  console.log(`Created ${relForLog(abs)} (title: "${title}", status: open)`);
}
