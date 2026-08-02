#!/usr/bin/env bun
/**
 * new-stage.mjs — add a stage to a plan: `plans/<plan>/NN_<name>.md`.
 *
 * **The numeric prefix is BOTH the order and the id** — "stage 20" is the
 * correct way to refer to one. There is no indirection layer: a reference is a
 * literal markdown path, and that path carries the prefix. Renumbering is
 * therefore a `move`, which is link-aware.
 *
 * Numbering is gap-spaced by ten, and inserting SPREADS into the gap rather than
 * filling from one end: `21, 22, 23` exhausts the space beside `20` while
 * leaving `24`–`29` empty, so the next insertion there has nowhere to go. This
 * script picks the midpoint of the largest gap when `--after` is given.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta,
  parseArgs, printHelp, relForLog, sanitizeName, isValidState, STATUSES,
} from './_lib.mjs';
import { parseOrderPrefixLoose } from '../_order-prefix.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const planRaw = args.flags.plan && args.flags.plan !== true ? String(args.flags.plan) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !planRaw || !rawName) {
  printHelp('issue new-stage', [
    '<issue-id> --plan <folder> --name <slug> [--title <text>] [--outcome <text>] [--who <name>]',
    '           [--status <state>] [--after <NN>] [--prefix <NN>] [--subtask <path,…>] [--json] [--tracker <path>]',
    '',
    'Add a stage file to a plan. The prefix is both the stage id and its order;',
    'stages are gap-spaced by ten so there is room to insert later.',
    '',
    '--plan      the plan folder under plans/ (e.g. 01_decoder-and-retention) — required',
    '--name      kebab-case stage name — required',
    '--title     frontmatter title (default: de-kebabed name)',
    '--outcome   one line: what "done" means for this stage',
    '--who       who the stage waits on',
    `--status    one of ${STATUSES.join('|')} (default open)`,
    '--after     insert after stage NN — takes the MIDPOINT of the gap that follows,',
    '            so the space beside NN is not exhausted from one end',
    '--prefix    explicit stage number, overriding --after',
    '--subtask   comma-separated subtask paths (issue-relative or relative to the',
    '            plan folder) to seed the `subtasks:` list',
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
    // Midpoint, not after+1 — filling from one end exhausts the gap.
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

// `--subtask` accepts an issue-relative path (`subtasks/…`) or one already
// relative to the plan folder. Emitted as a markdown link with the subtask's
// filename as placeholder text: the PATH is the truth, the text is a reading
// aid the renderer replaces with the live title.
const subtaskRefs = (args.flags.subtask && args.flags.subtask !== true ? String(args.flags.subtask) : '')
  .split(',').map((s) => s.trim()).filter(Boolean)
  .map((ref) => {
    const rel = ref.startsWith('subtasks/') ? `../../${ref}` : ref;
    const label = path.basename(ref.replace(/\.md$/, '')).replace(/^\d+[_-]/, '').replace(/-/g, ' ');
    return `  - "[${label}](${rel})"`;
  });

const fm = [
  '---',
  `title: ${JSON.stringify(title)}`,
  ...(args.flags.outcome && args.flags.outcome !== true ? [`outcome: ${JSON.stringify(String(args.flags.outcome))}`] : []),
  ...(args.flags.who && args.flags.who !== true ? [`who: ${String(args.flags.who)}`] : []),
  `status: ${status}`,
  ...(subtaskRefs.length ? ['subtasks:', ...subtaskRefs] : []),
  '---',
].join('\n');

// No `# H1`: the heading is generated as `<prefix> <title>` on the plan page,
// so writing one here duplicates a name the frontmatter already owns.
const body = `${fm}

## Todo

- [ ] ...

## Questions

- [ ] ...
`;

fs.writeFileSync(abs, body);

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id, plan: planRaw, file: fileName, path: relForLog(abs),
    stage: position, title, status,
  }, null, 2));
} else {
  console.log(`Created ${relForLog(abs)} — stage ${position} (title: "${title}", status: ${status})`);
}
