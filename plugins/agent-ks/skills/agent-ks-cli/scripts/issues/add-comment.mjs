#!/usr/bin/env bun
/**
 * add-comment.mjs — append a comment under <issue>/comments/ from
 * `templates/comment.md`. Auto-numbers the NNN_ prefix.
 *
 * Filename: NNN_YYYY-MM-DD_author.md, or NNN_<slug>.md with --slug.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, nextNumericPrefix, pad, todayISO,
  parseArgs, printHelp, relForLog,
} from './_lib.mjs';
import { renderTemplate } from '../_templates.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id || !args.flags.author || !args.flags.body) {
  printHelp('issue add-comment', [
    '<issue-id> --author <name> --body <markdown> [--date YYYY-MM-DD] [--slug <short-slug>] [--tracker <path>]',
    '',
    'Append a comment file under <issue>/comments/ from templates/comment.md. Auto-increments the NNN prefix.',
    'Default filename: NNN_YYYY-MM-DD_author.md.  With --slug: NNN_<slug>.md.',
    'A comment is two lines and a link to the file that holds the detail.',
  ]);
  process.exit(id && args.flags.author && args.flags.body ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);
const dir = path.join(tracker, id, 'comments');
if (!isInsideAllowed(dir, tracker)) {
  console.error(`Refusing to write outside the tracker: ${dir}`);
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

const next = nextNumericPrefix(dir);
const date = args.flags.date || todayISO();
const author = String(args.flags.author);
const fileName = args.flags.slug
  ? `${pad(next)}_${args.flags.slug}.md`
  : `${pad(next)}_${date}_${author}.md`;
const abs = path.join(dir, fileName);

fs.writeFileSync(abs, renderTemplate('comment', [['author', author], ['date', date]], { lead: String(args.flags.body) }));
console.log(`Wrote ${relForLog(abs)}`);
