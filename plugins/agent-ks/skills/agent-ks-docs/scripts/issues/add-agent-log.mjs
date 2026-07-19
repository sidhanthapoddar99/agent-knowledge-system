#!/usr/bin/env bun
/**
 * add-agent-log.mjs — append an agent-log entry for an issue.
 * Auto-increments iteration if not provided.
 *
 * Optional --group <a>[/<b>/…] places the file under agent-log/<a>/[<b>/…]
 * — nested subfolders up to the loader's depth cap (MAX_SUBFOLDER_DEPTH).
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, nextNumericPrefix, pad, todayISO,
  readIssueAgentLogs, parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id || !args.flags.body) {
  printHelp('issue add-agent-log', [
    '<issue-id> --body <markdown> [--status in-progress|success|failed] [--iteration N]',
    '[--agent <name>] [--date YYYY-MM-DD] [--slug <short-slug>] [--group <a>[/<b>/…]] [--tracker <path>]',
    '',
    'Append an agent-log file under <issue>/agent-log/ (or .../<a>/[<b>/…] with --group).',
    `--group accepts up to ${MAX_SUBFOLDER_DEPTH} slash-separated segments (e.g. "exploration" or "exploration/phase-1"); up to 3 is the recommended convention.`,
    'Iteration auto-increments from the highest existing iteration / sequence + 1.',
    'Default status: in-progress.  Default agent: claude.  Default slug: iter-<N>.',
  ]);
  process.exit(id && args.flags.body ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);
const baseDir = path.join(tracker, id, 'agent-log');
const groupSegments = args.flags.group
  ? args.flags.group.split('/').filter(Boolean)
  : [];
if (groupSegments.length > MAX_SUBFOLDER_DEPTH) {
  console.error(`--group accepts at most ${MAX_SUBFOLDER_DEPTH} segments (got ${groupSegments.length}: "${args.flags.group}")`);
  process.exit(1);
}
const dir = groupSegments.length > 0 ? path.join(baseDir, ...groupSegments) : baseDir;
if (!isInsideAllowed(dir, tracker)) {
  console.error(`Refusing to write outside the tracker: ${dir}`);
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

const existing = readIssueAgentLogs(tracker, id);
const inferIter = existing.length
  ? Math.max(...existing.map((l) => (l.iteration ?? l.sequence ?? 0))) + 1
  : 1;
const iteration = args.flags.iteration ? parseInt(args.flags.iteration, 10) : inferIter;
const next = nextNumericPrefix(dir);
const date = args.flags.date || todayISO();
const status = args.flags.status || 'in-progress';
const agent = args.flags.agent || 'claude';
const slug = args.flags.slug || `iter-${iteration}`;
const fileName = `${pad(next)}_${slug}.md`;
const abs = path.join(dir, fileName);

const body = `---\niteration: ${iteration}\nagent: ${agent}\nstatus: ${status}\ndate: ${date}\n---\n\n${args.flags.body}\n`;
fs.writeFileSync(abs, body);
console.log(`Wrote ${relForLog(abs)}`);
