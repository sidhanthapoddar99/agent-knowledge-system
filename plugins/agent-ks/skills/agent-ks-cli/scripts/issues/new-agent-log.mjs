#!/usr/bin/env bun
/**
 * new-agent-log.mjs — scaffold an agent log folder for an issue.
 *
 * An agent log is `agent-log/[<group>/]NNN_<code>_<name>/`: one run, one goal.
 * It starts with two files:
 *
 *   settings.json   { "status": "in-progress" } — the run's status
 *   00_index.md     templates/log-index-<kind>.md, or log-index.md for a custom
 *                   kind — the brief, the file index, the handover
 *
 * Files are added beside the index with `agent-ks issue new-round`, which also
 * lists each one under `## Files`. A child log inside a loop numbers from 120;
 * 100 and 110 stay free for a results or debrief folder.
 *
 * `00_index.md` is the brief. Point an agent at it and spend the prompt on the
 * delta. `--for` names the subtasks the run serves, as plain links.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad, csv,
  parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
  parseGroupSegments, sanitizeName, resolveSubtaskSelector, AGENT_LOG_INDEX,
} from './_lib.mjs';
import { renderTemplate, readTemplate, logIndexTemplateFor } from '../_templates.mjs';

// Framework-default kinds (mirror of src/loaders/issues.ts). An issue may add
// custom codes via settings.json → agentLogKinds; an unknown code renders
// without a symbol, so it is a warning and not an error.
const DEFAULT_KINDS = { lp: 'loop', au: 'audit', rf: 'refactor', re: 'research', it: 'iteration', wf: 'workflow' };

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const kind = args.flags.kind && args.flags.kind !== true ? String(args.flags.kind) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !kind || !rawName) {
  printHelp('issue new-agent-log', [
    '<issue-id> --kind <code> --name <slug> [--group <a[/b]>] [--prefix <NNN>] [--goal <text>] [--for <a,b>] [--json] [--tracker <path>]',
    '',
    'Scaffold agent-log/[<group>/]NNN_<code>_<name>/ with settings.json',
    '({"status": "in-progress"}) and 00_index.md from templates/log-index-<kind>.md',
    '(log-index.md for a custom kind).',
    'Add files beside the index with `agent-ks issue new-round`.',
    'If a run is already open for this work, append a file to it instead.',
    '',
    `--kind    kind code (defaults: ${Object.keys(DEFAULT_KINDS).join('/')}; custom via settings.json agentLogKinds)`,
    '--name    kebab-case run name (sanitised to [a-z0-9-])',
    '--group   nest under a folder path (created if missing; `_` preserved). Give a log folder',
    '          to open a child log inside it; child logs number from 120, gap-spaced by ten',
    '--prefix  explicit number (2–5 digits, e.g. 013) instead of the next gap-spaced one',
    '--goal    the lead line of 00_index.md: why this run exists',
    '--for     comma-separated subtasks the run serves (number, slug or path); each',
    '          becomes one plain link on the `Serves:` line, with the subtask title as text',
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

/**
 * Next run prefix: gap-spaced by ten over the run folders already there.
 * A log nested inside another log (the parent folder is itself
 * `NNN_<kind>_<name>`) starts at 120: the engine reads a sub-folder as a
 * child run only from prefix 100 up, and 100 and 110 stay free for a results
 * or debrief folder.
 */
const LOG_FOLDER = /^\d{2,5}[_-][a-z]{2}[_-]/;
function nextRunPrefix(dir) {
  const nested = LOG_FOLDER.test(path.basename(dir));
  let max = 0;
  if (fs.existsSync(dir)) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const m = e.name.match(/^(\d+)[_-]/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  const floor = nested ? 120 : 10;
  return max < floor ? floor : max + 10;
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

const goal = args.flags.goal && args.flags.goal !== true ? String(args.flags.goal).trim() : '';

// Every `--for` selector must resolve to exactly one subtask. The link is
// written relative to the log folder, with the subtask title as text.
const serves = [];
for (const sel of csv(args.flags.for)) {
  const matches = resolveSubtaskSelector(tracker, id, sel, [dir]);
  if (matches.length === 0) {
    console.error(`--for "${sel}": no subtask in ${id} matches it (give a number, a slug, or a path). Nothing written.`);
    process.exit(1);
  }
  if (matches.length > 1) {
    const names = matches.map((m) => [...m.groupPath, m.fileName].join('/')).join(', ');
    console.error(`--for "${sel}" matches more than one subtask: ${names}. Nothing written.`);
    process.exit(1);
  }
  const rel = path.relative(dir, matches[0].filePath).split(path.sep).join('/');
  const text = String(matches[0].title).replace(/[[\]]/g, '').trim() || matches[0].slug;
  serves.push(`[${text}](${rel})`);
}

// The template is chosen by kind. Its lead opens with the goal line and holds
// a `Serves:` line; seed those two and leave the rest for the author.
const templateName = logIndexTemplateFor(kind);
const t = readTemplate(templateName);
const leadLines = t.lead.split('\n');
if (goal) leadLines[0] = goal;
if (serves.length) {
  const i = leadLines.findIndex((l) => l.startsWith('Serves:'));
  if (i >= 0) leadLines[i] = `Serves: ${serves.join(', ')}`;
}
const index = renderTemplate(templateName, [['title', 'Index']], { lead: leadLines.join('\n') });

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'settings.json'), `{\n  "status": "in-progress"\n}\n`);
fs.writeFileSync(path.join(dir, AGENT_LOG_INDEX), index);
const written = ['settings.json', AGENT_LOG_INDEX];

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
  console.log(`  next: fill 00_index.md, then agent-ks issue new-round ${id} --log ${[...groupSegments, folderName].join('/')} --name <round>`);
}
