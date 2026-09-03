#!/usr/bin/env bun
/**
 * new-stage.mjs — add a stage to a plan: `plans/<plan>/NN_<name>.md` from
 * `templates/plan-stage.md`.
 *
 * The numeric prefix is both the order and the id: "stage 20" names one.
 * Numbering is gap-spaced by ten. `--after` takes the midpoint of the gap that
 * follows, so the space beside a stage is not used up from one end.
 *
 * `--subtask` takes numbers, slugs or paths. Each one is resolved to a subtask
 * file and written as one plain markdown link whose text is the subtask's
 * title. A selector that resolves to nothing is an error and nothing is
 * written.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, csv,
  parseArgs, printHelp, relForLog, sanitizeName, isValidState, STATUSES,
  resolveSubtaskSelector,
} from './_lib.mjs';
import { parseOrderPrefixLoose } from '../_order-prefix.mjs';
import { renderTemplate } from '../_templates.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const planRaw = args.flags.plan && args.flags.plan !== true ? String(args.flags.plan) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !planRaw || !rawName) {
  printHelp('issue new-stage', [
    '<issue-id> --plan <folder> --name <slug> [--title <text>] [--outcome <text>] [--notes <text>]',
    '           [--who <name>] [--status <state>] [--after <NN>] [--prefix <NN>] [--subtask <a,b>]',
    '           [--json] [--tracker <path>]',
    '',
    'Add a stage file to a plan from templates/plan-stage.md. The prefix is both the',
    'stage id and its order; stages are gap-spaced by ten.',
    '',
    '--plan      the plan folder under plans/ (e.g. 01_ship) — required',
    '--name      kebab-case stage name — required',
    '--title     frontmatter title (default: the name, de-kebabed and capitalised)',
    '--outcome   one line: what "done" means for this stage',
    '--notes     one line: why the stage sits here, or what it waits on',
    '--who       who the stage waits on',
    `--status    one of ${STATUSES.join('|')} (default open)`,
    '--after     insert after stage NN — takes the midpoint of the gap that follows',
    '--prefix    explicit stage number, overriding --after',
    '--subtask   comma-separated subtasks, each a number, a slug, or a path; each is',
    '            written to `subtasks:` as one plain link with the subtask title as text',
    '--json      print the created file as JSON',
  ]);
  process.exit(id && planRaw && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

if (!readIssueMeta(tracker, id)) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

const issueDir = path.join(tracker, id);
const planDir = path.join(issueDir, 'plans', planRaw);
if (!fs.existsSync(planDir)) {
  console.error(`No plan "${planRaw}" under ${relForLog(path.join(issueDir, 'plans'))}/ — open one with \`agent-ks issue new-plan\`.`);
  process.exit(1);
}

const name = sanitizeName(rawName);
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

const status = args.flags.status && args.flags.status !== true ? String(args.flags.status) : 'open';
if (!isValidState(status)) {
  console.error(`--status "${status}" is not one of ${STATUSES.join('|')}.`);
  process.exit(1);
}

/** Existing stage positions, ascending. `overview.md` is reserved, never a stage. */
const positions = fs.readdirSync(planDir, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'overview.md')
  .map((e) => parseOrderPrefixLoose(e.name.replace(/\.md$/, '')).position)
  .filter((p) => p !== null)
  .sort((a, b) => a - b);

const prefixRaw = args.flags.prefix && args.flags.prefix !== true ? String(args.flags.prefix) : '';
const afterRaw = args.flags.after && args.flags.after !== true ? String(args.flags.after) : '';

let position;
if (prefixRaw) {
  if (!/^\d{1,5}$/.test(prefixRaw)) {
    console.error(`--prefix "${prefixRaw}" must be digits.`);
    process.exit(1);
  }
  position = parseInt(prefixRaw, 10);
} else if (afterRaw) {
  const after = parseInt(afterRaw, 10);
  if (!positions.includes(after)) {
    console.error(`--after ${afterRaw}: no stage ${afterRaw} in ${planRaw} (have ${positions.join(', ') || 'none'}).`);
    process.exit(1);
  }
  const next = positions.find((p) => p > after);
  if (next === undefined) {
    position = after + 10;
  } else if (next - after < 2) {
    console.error(
      `No room between stage ${after} and stage ${next}. Renumber the tail with ` +
      `\`agent-ks move\` (link-aware — it rewrites every reference, frontmatter included) ` +
      `before inserting here.`,
    );
    process.exit(1);
  } else {
    // The midpoint, so the gap is not used up from one end.
    position = after + Math.floor((next - after) / 2);
  }
} else {
  const max = positions.length ? positions[positions.length - 1] : 0;
  position = max === 0 ? 10 : max + 10;
}

if (positions.includes(position)) {
  console.error(`Stage ${position} already exists in ${planRaw}.`);
  process.exit(1);
}

const prefix = String(position).padStart(2, '0');
const fileName = `${prefix}_${name}.md`;
const abs = path.join(planDir, fileName);

if (!isInsideAllowed(abs, tracker)) {
  console.error(`Refusing to write outside the tracker: ${abs}`);
  process.exit(1);
}
if (fs.existsSync(abs)) {
  console.error(`Stage file already exists: ${relForLog(abs)}`);
  process.exit(1);
}

const title = args.flags.title && args.flags.title !== true
  ? String(args.flags.title)
  : name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

// Every `--subtask` selector must resolve to exactly one subtask file. The
// link is written relative to the plan folder, with the subtask title as text.
const subtaskLinks = [];
for (const sel of csv(args.flags.subtask)) {
  const matches = resolveSubtaskSelector(tracker, id, sel, [planDir]);
  if (matches.length === 0) {
    console.error(`--subtask "${sel}": no subtask in ${id} matches it (give a number, a slug, or a path). Nothing written.`);
    process.exit(1);
  }
  if (matches.length > 1) {
    const names = matches.map((m) => [...m.groupPath, m.fileName].join('/')).join(', ');
    console.error(`--subtask "${sel}" matches more than one subtask: ${names}. Nothing written.`);
    process.exit(1);
  }
  const rel = path.relative(planDir, matches[0].filePath).split(path.sep).join('/');
  const text = String(matches[0].title).replace(/[[\]]/g, '').trim() || matches[0].slug;
  subtaskLinks.push(`[${text}](${rel})`);
}

const opt = (flag) => (args.flags[flag] && args.flags[flag] !== true ? String(args.flags[flag]) : '');
const body = renderTemplate('plan-stage', [
  ['title', title],
  ['status', status],
  ['outcome', opt('outcome')],
  ['notes', opt('notes')],
  ['who', opt('who')],
  ['subtasks', subtaskLinks],
]);

fs.writeFileSync(abs, body);

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id, plan: planRaw, file: fileName, path: relForLog(abs),
    stage: position, title, status, subtasks: subtaskLinks,
  }, null, 2));
} else {
  console.log(`Created ${relForLog(abs)} — stage ${position} (title: "${title}", status: ${status}${subtaskLinks.length ? `, ${subtaskLinks.length} subtask link(s)` : ''})`);
}
