#!/usr/bin/env bun
/**
 * set-state.mjs — update an issue's status (top-level settings.json) or
 * a subtask's state (frontmatter). Path is allow-listed to the content root.
 */

import path from 'node:path';
import {
  resolveTracker, isValidState, isInsideAllowed,
  setJsonField, setFrontmatterField, parseArgs, printHelp,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const target = args._[0];
const state = args._[1];

if (args.flags.help || !target || !state) {
  printHelp('issue set-state', [
    '<issue-id-or-subtask-path> <state> [--tracker <path>]',
    '',
    '  Issue:    bun scripts/issues/set-state.mjs 2026-04-19-foo review',
    '  Subtask:  bun scripts/issues/set-state.mjs 2026-04-19-foo/subtasks/02_bar.md closed',
    '',
    'state must be one of: open | review | closed | cancelled.',
    'Refuses to write outside the content root.',
  ]);
  process.exit(target && state ? 0 : 1);
}

if (!isValidState(state)) {
  console.error(`Invalid state: ${state}. Must be one of open|review|closed|cancelled.`);
  process.exit(1);
}

const tracker = resolveTracker(args.flags.tracker);

let result;
if (target.endsWith('.md') || target.includes('/')) {
  // Subtask path
  const abs = path.isAbsolute(target) ? target : path.resolve(tracker, target);
  if (!isInsideAllowed(abs, tracker)) {
    console.error(`Refusing to write outside the tracker: ${abs}`);
    process.exit(1);
  }
  result = setFrontmatterField(abs, 'state', state);
} else {
  // Issue id — mutate top-level settings.json
  const settingsPath = path.join(tracker, target, 'settings.json');
  if (!isInsideAllowed(settingsPath, tracker)) {
    console.error(`Refusing to write outside the tracker: ${settingsPath}`);
    process.exit(1);
  }
  result = setJsonField(settingsPath, 'status', state);
}

if (!result.ok) {
  console.error(result.message);
  process.exit(1);
}
console.log(result.message);
