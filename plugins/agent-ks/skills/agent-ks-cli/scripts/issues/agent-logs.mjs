#!/usr/bin/env bun
/**
 * agent-logs.mjs — print the last N agent logs of an issue, each with its
 * status, its index and its files. For catching up before resuming work.
 *
 * A log is a run folder `NNN_<code>_<name>/` holding settings.json, 00_index.md
 * and flat files beside it.
 */

import fs from 'node:fs';
import { resolveTracker, readIssueAgentLogFolders, parseArgs, printHelp } from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id) {
  printHelp('issue agent-logs', [
    '<issue-id> [--last N] [--full] [--json] [--tracker <path>]',
    '',
    'Print the last N agent logs (default 3): the run folder, its status, its index',
    'and its files, one line each. --full prints the index and every file body too.',
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
  if (r.round === null) return 'file';
  return r.report === 0 ? `round ${r.round}` : `round ${r.round} report ${r.report}`;
}

for (const log of tail) {
  const grp = log.groupPath.length > 0 ? `${log.groupPath.join('/')}/` : '';
  console.log(`# ${grp}${log.name}    status: ${log.status || '—'}    kind: ${log.kind}`);
  console.log(`  ${log.index ? `${log.index.fileName}  ${log.index.title}` : `(no 00_index.md)`}`);
  for (const r of log.rounds) {
    console.log(`  ${r.fileName}  ${roundLabel(r)}  status: ${r.status || '—'}  agent: ${r.agent || '—'}  ${r.title}`);
  }
  if (args.flags.full) {
    if (log.index) {
      console.log('');
      console.log(fs.readFileSync(log.index.filePath, 'utf-8'));
    }
    for (const r of log.rounds) {
      console.log('');
      console.log(fs.readFileSync(r.filePath, 'utf-8'));
    }
    console.log('');
  }
}
