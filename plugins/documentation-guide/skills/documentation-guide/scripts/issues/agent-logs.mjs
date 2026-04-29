#!/usr/bin/env bun
/**
 * agent-logs.mjs — print the last N agent-log entries for an issue.
 * For catching up before resuming work on an issue with prior iterations.
 */

import fs from 'node:fs';
import { DEFAULT_TRACKER, readIssueAgentLogs, parseArgs, printHelp } from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];

if (args.flags.help || !id) {
  printHelp('agent-logs', [
    '<issue-id> [--last N] [--full] [--json] [--tracker <path>]',
    '',
    'Print the last N agent-log entries (default 3).  --full prints bodies too.',
    'Default output: file path, status, agent, date, iteration — no body.',
  ]);
  process.exit(id ? 0 : 1);
}

const tracker = args.flags.tracker || DEFAULT_TRACKER;
const lastN = parseInt(args.flags.last || '3', 10);
const logs = readIssueAgentLogs(tracker, id);
const tail = lastN > 0 ? logs.slice(-lastN) : logs;

if (args.flags.json) {
  console.log(JSON.stringify(tail, null, 2));
  process.exit(0);
}

if (tail.length === 0) {
  console.log(`(no agent-log entries for ${id})`);
  process.exit(0);
}

for (const log of tail) {
  const grp = log.groupPath.length > 0 ? `${log.groupPath.join('/')}/` : '';
  console.log(`# ${grp}${log.name}`);
  console.log(`  status: ${log.status || '—'}    agent: ${log.agent || '—'}    date: ${log.date || '—'}    iteration: ${log.iteration ?? '—'}`);
  if (args.flags.full) {
    console.log('');
    console.log(fs.readFileSync(log.filePath, 'utf-8'));
    console.log('');
  }
}
