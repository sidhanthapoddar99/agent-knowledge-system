#!/usr/bin/env bun
/**
 * review-queue.mjs — list everything currently awaiting human review.
 *
 *   - Issues with status: review (direct)
 *   - Issues with status: open AND any subtask in state: review (review-debt promotion)
 */

import {
  resolveTracker, listIssueFolders, readIssueMeta, readIssueSubtasks,
  parseArgs, printHelp, categoryOf, normalizeStatus,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.flags.help) {
  printHelp('issue review-queue', [
    '[--json] [--tracker <path>]',
    '',
    'List items needing human review:',
    '  • issues whose status is in the Review category (review | input-needed)',
    '  • active (non-closed) issues with ≥1 subtask in the Review category (review-debt promotion)',
  ]);
  process.exit(0);
}

const tracker = resolveTracker(args.flags.tracker);
const matches = [];

for (const id of listIssueFolders(tracker)) {
  const meta = readIssueMeta(tracker, id);
  if (!meta) continue;
  const cat = categoryOf(normalizeStatus(meta.status));
  let reason = null;
  if (cat === 'review') reason = 'issue';
  else if (cat !== 'closed') {
    const subs = readIssueSubtasks(tracker, id);
    const reviewSubs = subs.filter((s) => s.category === 'review');
    if (reviewSubs.length) reason = `${reviewSubs.length} review subtask${reviewSubs.length > 1 ? 's' : ''}`;
  }
  if (reason) matches.push({ id, status: meta.status, reason, title: meta.title });
}

if (args.flags.json) {
  console.log(JSON.stringify(matches, null, 2));
} else {
  for (const m of matches) console.log(`${m.id}\t${m.status}\t(${m.reason})\t${m.title}`);
}
