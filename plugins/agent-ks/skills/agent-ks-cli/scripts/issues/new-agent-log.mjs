#!/usr/bin/env bun
/**
 * new-agent-log.mjs — scaffold an agent log folder for an issue.
 *
 * An agent log is `agent-log/[<group>/]NNN_<code>_<name>/`: one run, one goal.
 * It starts with two files:
 *
 *   settings.json   { "status": "in-progress" } — the run's status
 *   01_summary.md   templates/log-summary.md — the run's one conclusive file
 *
 * Rounds are added beside the summary with `agent-ks issue new-round`. The
 * folder holds files only: no working folder, no index, no child log.
 *
 * `01_summary.md` is the brief. Point an agent at it and spend the prompt on
 * the delta.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad,
  parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
  parseGroupSegments, sanitizeName,
} from './_lib.mjs';
import { renderTemplate } from '../_templates.mjs';

// Framework-default kinds (mirror of src/loaders/issues.ts). An issue may add
// custom codes via settings.json → agentLogKinds; an unknown code renders
// without a symbol, so it is a warning and not an error.
const DEFAULT_KINDS = { lp: 'loop', au: 'audit', rf: 'refactor', it: 'iteration', wf: 'workflow' };

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const kind = args.flags.kind && args.flags.kind !== true ? String(args.flags.kind) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !kind || !rawName) {
  printHelp('issue new-agent-log', [
    '<issue-id> --kind <code> --name <slug> [--group <a[/b]>] [--prefix <NNN>] [--goal <text>] [--json] [--tracker <path>]',
    '',
    'Scaffold agent-log/[<group>/]NNN_<code>_<name>/ with settings.json',
    '({"status": "in-progress"}) and 01_summary.md from templates/log-summary.md.',
    'Add rounds beside the summary with `agent-ks issue new-round`.',
    'If a run is already open for this work, append a round to it instead.',
    '',
    `--kind    kind code (defaults: ${Object.keys(DEFAULT_KINDS).join('/')}; custom via settings.json agentLogKinds)`,
    '--name    kebab-case run name (sanitised to [a-z0-9-])',
    '--group   nest under a grouping folder path (created if missing; `_` preserved;',
    '          numbering is scoped to the group folder)',
    '--prefix  explicit number (2–5 digits, e.g. 013) instead of the next gap-spaced one',
    '--goal    the lead paragraph of the summary: why this run exists',
    '--json    print the created folder + files as JSON',
  ]);
  process.exit(id && kind && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

const meta = readIssueMeta(tracker, id);
if (!meta) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

const customKinds = meta.agentLogKinds && typeof meta.agentLogKinds === 'object' ? Object.keys(meta.agentLogKinds) : [];
const effective = new Set([...Object.keys(DEFAULT_KINDS), ...customKinds]);
if (!effective.has(kind)) {
  console.error(`warning: kind "${kind}" is not in this issue's effective set (${[...effective].sort().join('/')}) — it renders without a symbol. Declare it in settings.json agentLogKinds to give it one.`);
}

const name = sanitizeName(rawName);
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

const groupRaw = args.flags.group && args.flags.group !== true ? String(args.flags.group) : '';
const groupSegments = parseGroupSegments(groupRaw);

if (groupSegments.length >= MAX_SUBFOLDER_DEPTH) {
  console.error(
    `--group nests ${groupSegments.length} folder levels; the loader reads at most ` +
    `${MAX_SUBFOLDER_DEPTH - 1} levels below agent-log/ (depth cap ${MAX_SUBFOLDER_DEPTH}). Flatten the grouping.`,
  );
  process.exit(1);
}

const prefixRaw = args.flags.prefix && args.flags.prefix !== true ? String(args.flags.prefix) : '';
if (prefixRaw && !/^\d{2,5}$/.test(prefixRaw)) {
  console.error(`--prefix "${prefixRaw}" must be 2–5 digits (e.g. 013).`);
  process.exit(1);
}

const baseDir = path.join(tracker, id, 'agent-log', ...groupSegments);

/** Next run prefix: gap-spaced by ten over the run folders already there. */
function nextRunPrefix(dir) {
  let max = 0;
  if (fs.existsSync(dir)) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const m = e.name.match(/^(\d+)[_-]/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max === 0 ? 10 : max + 10;
}

const prefix = prefixRaw || pad(nextRunPrefix(baseDir));
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

const goal = args.flags.goal && args.flags.goal !== true ? String(args.flags.goal) : '';
const summary = renderTemplate('log-summary', [['title', 'Summary']], { lead: goal });

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'settings.json'), `{\n  "status": "in-progress"\n}\n`);
fs.writeFileSync(path.join(dir, '01_summary.md'), summary);
const written = ['settings.json', '01_summary.md'];

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
  console.log(`  next: agent-ks issue new-round ${id} --log ${[...groupSegments, folderName].join('/')} --name <round>`);
}
