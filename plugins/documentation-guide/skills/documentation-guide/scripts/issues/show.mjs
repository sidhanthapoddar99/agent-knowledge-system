#!/usr/bin/env bun
/**
 * show.mjs — print one issue's metadata + subtask state summary +
 * agent-log heads (no full bodies). Use --full for everything.
 *
 * `updated` is intentionally not shown here. The dev-server's loader
 * derives it from git (`loaders/issue-dates.ts`), but mirroring that
 * derivation in this CLI would mean a per-call git spawn that doesn't
 * scale. A future plugin variant that talks to the running dev server
 * will surface `updated` via that channel.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, readIssueMeta, readIssueSubtasks, readIssueComments,
  readIssueAgentLogs, parseArgs, printHelp, issueDateFromId,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id) {
  printHelp('issue show', [
    '<issue-id> [--full] [--json] [--tracker <path>]',
    '',
    'Print metadata + subtask state summary + comment heads + agent-log heads.',
    '--full also prints issue.md, comment bodies, and agent-log bodies.',
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
const agentLogs = readIssueAgentLogs(tracker, id);

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
const counts = subtasks.reduce((a, s) => { a[s.state] = (a[s.state] || 0) + 1; return a; }, {});
console.log(`  open: ${counts.open || 0}  review: ${counts.review || 0}  closed: ${counts.closed || 0}  cancelled: ${counts.cancelled || 0}`);
for (const s of subtasks) console.log(`  [${s.state}] ${s.slug} — ${s.title}`);

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
  const tags = [];
  if (log.status) tags.push(log.status);
  if (log.agent) tags.push(`by ${log.agent}`);
  if (log.date) tags.push(log.date);
  console.log(`  ${grp}${log.name}` + (tags.length ? `  [${tags.join(' · ')}]` : ''));
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
    console.log(`\n---\n## agent-log/${grp}${log.name}\n`);
    console.log(fs.readFileSync(log.filePath, 'utf-8'));
  }
}
