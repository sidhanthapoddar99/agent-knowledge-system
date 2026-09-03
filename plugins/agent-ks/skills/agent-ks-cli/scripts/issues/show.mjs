#!/usr/bin/env bun
/**
 * show.mjs — print one issue's metadata, its subtask status summary, its
 * comment heads and its agent logs (run folder, status, round count).
 * --full prints issue.md, every comment, every log summary and every round.
 *
 * `updated` is not shown here. The dev server derives it from git
 * (`loaders/issue-dates.ts`); mirroring that in the CLI would cost a git spawn
 * per call.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, readIssueMeta, readIssueSubtasks, readIssueComments,
  readIssueAgentLogFolders, parseArgs, printHelp, issueDateFromId,
} from './_lib.mjs';
import { OLD_SHAPE_HINT } from './_agent-log-shape.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id) {
  printHelp('issue show', [
    '<issue-id> [--full] [--json] [--tracker <path>]',
    '',
    'Print metadata + subtask status summary + comment heads + agent logs (status, rounds).',
    '--full also prints issue.md, comment bodies, log summaries and round bodies.',
  ]);
  process.exit(id ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);
const meta = readIssueMeta(tracker, id);
if (!meta) {
  console.error(`Issue not found: ${id}`);
  process.exit(1);
}

const subtasks = readIssueSubtasks(tracker, id);
const comments = readIssueComments(tracker, id);
const agentLogs = readIssueAgentLogFolders(tracker, id);

const created = issueDateFromId(id);

if (args.flags.json) {
  console.log(JSON.stringify({ id, created, meta, subtasks, comments, agentLogs }, null, 2));
  process.exit(0);
}

console.log(`# ${meta.title}`);
console.log(`Id:        ${id}`);
console.log(`Status:    ${meta.status}    Priority: ${meta.priority}`);
console.log(`Component: ${(Array.isArray(meta.component) ? meta.component : []).join(', ') || '—'}`);
console.log(`Labels:    ${(Array.isArray(meta.labels) ? meta.labels : []).join(', ') || '—'}`);
console.log(`Created:   ${created || '—'}`);
if (meta.description) console.log(`\n${meta.description}`);

console.log(`\n## Subtasks (${subtasks.length})`);
const counts = subtasks.reduce((a, s) => { a[s.category] = (a[s.category] || 0) + 1; return a; }, {});
console.log(`  not-started: ${counts['not-started'] || 0}  in-progress: ${counts['in-progress'] || 0}  review: ${counts.review || 0}  closed: ${counts.closed || 0}`);
for (const s of subtasks) console.log(`  [${s.status}] ${s.slug} — ${s.title}`);

console.log(`\n## Comments (${comments.length})`);
for (const c of comments) {
  const tags = [];
  if (c.author) tags.push(`by ${c.author}`);
  if (c.date) tags.push(c.date);
  console.log(`  ${c.name}` + (tags.length ? `  (${tags.join(', ')})` : ''));
}

console.log(`\n## Agent logs (${agentLogs.length})`);
for (const log of agentLogs) {
  const grp = log.groupPath.length > 0 ? `${log.groupPath.join('/')}/` : '';
  const rounds = log.rounds.filter((r) => r.report === 0).length;
  const reports = log.rounds.filter((r) => r.report !== null && r.report > 0).length;
  const tags = [log.status || '—', `${rounds} round${rounds === 1 ? '' : 's'}`];
  if (reports) tags.push(`${reports} report${reports === 1 ? '' : 's'}`);
  if (log.oldShape) tags.push(OLD_SHAPE_HINT);
  console.log(`  ${grp}${log.name}  [${tags.join(' · ')}]`);
}

if (args.flags.full) {
  const issuePath = path.join(tracker, id, 'issue.md');
  if (fs.existsSync(issuePath)) {
    console.log(`\n---\n## issue.md\n`);
    console.log(fs.readFileSync(issuePath, 'utf-8'));
  }
  for (const c of comments) {
    console.log(`\n---\n## comments/${c.name}\n`);
    console.log(fs.readFileSync(c.filePath, 'utf-8'));
  }
  for (const log of agentLogs) {
    const grp = log.groupPath.length > 0 ? `${log.groupPath.join('/')}/` : '';
    if (log.summary) {
      console.log(`\n---\n## agent-log/${grp}${log.name}/${log.summary.fileName}\n`);
      console.log(fs.readFileSync(log.summary.filePath, 'utf-8'));
    }
    if (log.oldShape) continue;
    for (const r of log.rounds) {
      console.log(`\n---\n## agent-log/${grp}${log.name}/${r.fileName}\n`);
      console.log(fs.readFileSync(r.filePath, 'utf-8'));
    }
  }
}
