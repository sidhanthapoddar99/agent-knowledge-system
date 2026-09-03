#!/usr/bin/env bun
/**
 * new-subtask.mjs — scaffold a subtask file from `templates/subtask.md`.
 *
 * Writes `subtasks/[<group>/]NN_<name>.md`, gap-spaced by ten. `--index`
 * writes the group's index leaf, `00_<name>.md`, from the same template. The
 * lead paragraph comes from `--overview`; every other part is the template.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad,
  parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
  parseGroupSegments, sanitizeName,
} from './_lib.mjs';
import { renderTemplate } from '../_templates.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const IS_INDEX = !!args.flags.index;
const rawName = args.flags.name && args.flags.name !== true
  ? String(args.flags.name)
  : (IS_INDEX ? 'overview' : null);

if (args.flags.help || !id || !rawName) {
  printHelp('issue new-subtask', [
    '<issue-id> --name <slug> [--title <text>] [--group <a[/b]>] [--overview <text>] [--index] [--json] [--tracker <path>]',
    '',
    'Write subtasks/[<group>/]NN_<name>.md from templates/subtask.md: frontmatter',
    'title + status, the lead paragraph, then the five numbered sections.',
    'The prefix is the next gap-spaced number in the target folder.',
    '',
    '--name      kebab-case subtask name (sanitised to [a-z0-9-]) — required unless --index',
    '--title     frontmatter title (default: the name, de-kebabed and capitalised)',
    '--group     nest under a grouping folder path (created if missing; `_` is preserved,',
    `            it is the ordering-prefix separator; at most ${MAX_SUBFOLDER_DEPTH - 1} levels)`,
    '--overview  the lead paragraph: why this subtask exists',
    '--index     write the group index leaf 00_<name>.md (default name: overview) from the same template',
    '--json      print the created file as JSON',
  ]);
  process.exit(id && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

const meta = readIssueMeta(tracker, id);
if (!meta) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
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
    `--group "${groupRaw}" nests ${groupSegments.length} folder levels; the loader ` +
    `reads at most ${MAX_SUBFOLDER_DEPTH - 1} grouping levels below subtasks/ ` +
    `(depth cap ${MAX_SUBFOLDER_DEPTH}). Flatten the grouping.`,
  );
  process.exit(1);
}

const title = args.flags.title && args.flags.title !== true
  ? String(args.flags.title)
  : name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

const baseDir = path.join(tracker, id, 'subtasks', ...groupSegments);

// Next prefix — gap-spaced by ten. Files and folders share one numbering.
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

const prefix = IS_INDEX ? '00' : pad(nextPrefix(baseDir));
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

const overview = args.flags.overview && args.flags.overview !== true ? String(args.flags.overview) : '';
const text = renderTemplate('subtask', [['title', title], ['status', 'open']], { lead: overview });

fs.mkdirSync(baseDir, { recursive: true });
fs.writeFileSync(abs, text);

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id,
    file: fileName,
    path: relForLog(abs),
    group: groupSegments.join('/') || null,
    title,
    index: IS_INDEX,
  }, null, 2));
} else {
  console.log(`Created ${relForLog(abs)} (title: "${title}", status: open)`);
}
