#!/usr/bin/env bun
/**
 * new-plan.mjs — open a new plan in an issue's `plans/` section.
 *
 * A plan is a folder: `plans/NN_<name>/` holding `settings.json` (title +
 * status), a reserved `overview.md`, and `NN_<stage>.md` stage files added with
 * `agent-ks issue new-stage`.
 *
 * A plan is a SCHEDULE — order, blocking, current focus, and the scope of this
 * round of work. Everything else about the work lives in the subtasks its stages
 * reference. **It stores no status of its own about that work**, so it cannot
 * drift from reality: the renderer resolves the references and pulls each
 * subtask's live status.
 *
 * Which plan is ACTIVE is derived, never stored — the highest-numbered plan that
 * is not `done`/`dropped`. One open plan at a time is convention, so this script
 * warns rather than refuses; nothing validates it.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, readJson, pad,
  parseArgs, printHelp, relForLog, sanitizeName, isValidState,
  TERMINAL_STATUSES, normalizeStatus, STATUSES,
} from './_lib.mjs';
import { parseOrderPrefixLoose } from '../_order-prefix.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !rawName) {
  printHelp('issue new-plan', [
    '<issue-id> --name <slug> [--title <text>] [--overview <text>] [--prefix <NN>] [--json] [--tracker <path>]',
    '',
    'Open a plan at plans/NN_<name>/ with settings.json + overview.md. Add stages',
    'with `agent-ks issue new-stage`.',
    '',
    '--name      kebab-case plan slug (sanitised to [a-z0-9-]) — required',
    '--title     settings.json title (default: de-kebabed name)',
    `--status    settings.json status (default open; one of ${STATUSES.join('|')})`,
    '--overview  seed overview.md with this text instead of its placeholder',
    '--prefix    explicit plan number (1-2 digits) instead of the next one',
    '--json      print the created folder + files as JSON',
  ]);
  process.exit(id && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

if (!readIssueMeta(tracker, id)) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

const name = sanitizeName(rawName);
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

const plansDir = path.join(tracker, id, 'plans');

/** Existing plan folders as { folder, position, status }. */
function readPlans() {
  if (!fs.existsSync(plansDir)) return [];
  return fs.readdirSync(plansDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const settings = readJson(path.join(plansDir, e.name, 'settings.json')) || {};
      return {
        folder: e.name,
        position: parseOrderPrefixLoose(e.name).position,
        status: normalizeStatus(settings.status) || 'open',
      };
    })
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
}

const existing = readPlans();
const stillOpen = existing.filter((p) => !TERMINAL_STATUSES.includes(p.status));
if (stillOpen.length > 0) {
  console.error(
    `note: ${stillOpen.map((p) => p.folder).join(', ')} ${stillOpen.length > 1 ? 'are' : 'is'} ` +
    `still open. One plan open at a time is the convention — close the previous one ` +
    `(settings.json "status": "done" + a \`## Closed\` section in its overview.md saying ` +
    `what shipped and what was DROPPED rather than finished) unless this is deliberate.`,
  );
}

const prefixRaw = args.flags.prefix && args.flags.prefix !== true ? String(args.flags.prefix) : '';
if (prefixRaw && !/^\d{1,2}$/.test(prefixRaw)) {
  console.error(`--prefix "${prefixRaw}" must be 1–2 digits (e.g. 02).`);
  process.exit(1);
}
const maxPos = existing.reduce((m, p) => Math.max(m, p.position ?? 0), 0);
const prefix = prefixRaw ? prefixRaw.padStart(2, '0') : pad(maxPos + 1, 2);

const folderName = `${prefix}_${name}`;
const dir = path.join(plansDir, folderName);

if (!isInsideAllowed(dir, tracker)) {
  console.error(`Refusing to write outside the tracker: ${dir}`);
  process.exit(1);
}
if (fs.existsSync(dir)) {
  console.error(`Plan already exists: ${relForLog(dir)}`);
  process.exit(1);
}

const title = args.flags.title && args.flags.title !== true
  ? String(args.flags.title)
  : name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

const status = args.flags.status && args.flags.status !== true ? String(args.flags.status) : 'open';
if (!isValidState(status)) {
  console.error(`--status "${status}" is not one of ${STATUSES.join('|')}.`);
  process.exit(1);
}

const overviewBody = args.flags.overview && args.flags.overview !== true
  ? `${String(args.flags.overview).trim()}\n`
  : `> [!NOTE]\n> What this plan is for: the round of work it schedules and what it is driving\n> toward. Renders at the top of the plan page, above the stage table.\n>\n> When the plan closes, add a \`## Closed\` section here — what shipped, what was\n> **dropped rather than finished** and why, and a pointer to the successor plan.\n> Written once and never edited after.\n`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, 'settings.json'),
  `{\n  "title": ${JSON.stringify(title)},\n  "status": ${JSON.stringify(status)}\n}\n`,
);
fs.writeFileSync(path.join(dir, 'overview.md'), `---\ntitle: ${JSON.stringify(title)}\n---\n\n${overviewBody}`);

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id, folder: folderName, path: relForLog(dir), title, status,
    files: ['settings.json', 'overview.md'],
  }, null, 2));
} else {
  console.log(`Created ${relForLog(dir)}/ — settings.json overview.md (title: "${title}", status: ${status})`);
  console.log(`  next: agent-ks issue new-stage ${id} --plan ${folderName} --name <stage>`);
}
