#!/usr/bin/env bun
/**
 * agent-logs.mjs — print the last N agent logs of an issue, each with its
 * status, its summary and its rounds. For catching up before resuming work.
 *
 * A log is a run folder `NNN_<code>_<name>/` holding settings.json,
 * 01_summary.md and flat NN_<round>.md files. An old-shape folder is listed
 * with a note and without rounds.
 */

import fs from 'node:fs';
import { resolveTracker, readIssueAgentLogFolders, parseArgs, printHelp } from './_lib.mjs';
import { OLD_SHAPE_HINT } from './_agent-log-shape.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id) {
  printHelp('issue agent-logs', [
    '<issue-id> [--last N] [--full] [--json] [--tracker <path>]',
    '',
    'Print the last N agent logs (default 3): the run folder, its status, its summary',
    'and its rounds, one line each. --full prints the summary and every round body too.',
  ]);
  process.exit(id ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);
const lastN = parseInt(args.flags.last || '3', 10);
const logs = readIssueAgentLogFolders(tracker, id);
const tail = lastN > 0 ? logs.slice(-lastN) : logs;

if (args.flags.json) {
  console.log(JSON.stringify(tail, null, 2));
  process.exit(0);
}

if (tail.length === 0) {
  console.log(`(no agent logs for ${id})`);
  process.exit(0);
}

function roundLabel(r) {
  if (r.round === null) return 'no round prefix';
  return r.report === 0 ? `round ${r.round}` : `round ${r.round} report ${r.report}`;
}

for (const log of tail) {
  const grp = log.groupPath.length > 0 ? `${log.groupPath.join('/')}/` : '';
  console.log(`# ${grp}${log.name}    status: ${log.status || '—'}    kind: ${log.kind}`);
  if (log.oldShape) console.log(`  (${OLD_SHAPE_HINT})`);
  console.log(`  ${log.summary ? `${log.summary.fileName}  ${log.summary.title}` : `(no 01_summary.md)`}`);
  if (!log.oldShape) {
    for (const r of log.rounds) {
      console.log(`  ${r.fileName}  ${roundLabel(r)}  status: ${r.status || '—'}  agent: ${r.agent || '—'}  ${r.title}`);
    }
  }
  if (args.flags.full) {
    if (log.summary) {
      console.log('');
      console.log(fs.readFileSync(log.summary.filePath, 'utf-8'));
    }
    if (!log.oldShape) {
      for (const r of log.rounds) {
        console.log('');
        console.log(fs.readFileSync(r.filePath, 'utf-8'));
      }
    }
    console.log('');
  }
}
