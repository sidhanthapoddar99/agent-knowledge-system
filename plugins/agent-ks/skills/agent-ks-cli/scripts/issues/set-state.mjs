#!/usr/bin/env bun
/**
 * set-state.mjs — set an issue's `status` (top-level settings.json) or a
 * subtask's `status` (frontmatter). Both levels share one vocabulary now.
 * Path is allow-listed to the content root.
 *
 * Targeting a subtask (any of):
 *   • by path:   set-state <id>/subtasks/02_bar.md review
 *   • by number: set-state <id> review --subtask 02
 *   • by slug:   set-state <id> review --subtask 02_bar
 * An unresolved `--subtask` is an error; it never falls through to the issue.
 */

import path from 'node:path';
import {
  resolveTracker, isValidState, isInsideAllowed, resolveSubtaskSelector,
  setJsonField, setFrontmatterField, parseArgs, printHelp, STATUSES,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const target = args._[0];
const status = args._[1];
const subtaskSel = args.flags.subtask; // number or slug, optional

if (args.flags.help || !target || !status) {
  printHelp('issue set-state', [
    '<issue-id-or-subtask-path> <status> [--subtask <num|slug|path>] [--tracker <path>]',
    '',
    '  Issue:            set-state 2026-04-19-foo review',
    '  Subtask by path:  set-state 2026-04-19-foo/subtasks/02_bar.md done',
    '  Subtask by num:   set-state 2026-04-19-foo done --subtask 02',
    '',
    `status must be one of: ${STATUSES.join(' | ')}.`,
    'Agents set up to `review`, `input-needed` or `superseded`; `done`/`dropped` are human-only.',
    '`superseded` = the scope moved elsewhere. Write a `→ where it went` line in the file.',
    'Refuses to write outside the content root.',
  ]);
  process.exit(target && status ? 0 : 1);
}

if (!isValidState(status)) {
  console.error(`Invalid status: ${status}. Must be one of ${STATUSES.join('|')}.`);
  process.exit(1);
}

const tracker = resolveTracker(args.flags.tracker);

let result;
if (subtaskSel && !target.includes('/')) {
  // Issue id + --subtask selector (number, slug, or path) → the subtask file.
  const matches = resolveSubtaskSelector(tracker, target, subtaskSel);
  if (matches.length === 0) {
    console.error(`No subtask matching \`${subtaskSel}\` in ${target}. (Nothing changed — refusing to fall through to the issue status.)`);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`Ambiguous --subtask \`${subtaskSel}\` in ${target}: ${matches.map((m) => m.slug).join(', ')}. Be more specific.`);
    process.exit(1);
  }
  const abs = matches[0].filePath;
  if (!isInsideAllowed(abs, tracker)) {
    console.error(`Refusing to write outside the tracker: ${abs}`);
    process.exit(1);
  }
  result = setFrontmatterField(abs, 'status', status);
} else if (target.endsWith('.md') || target.includes('/')) {
  // Explicit subtask path
  const abs = path.isAbsolute(target) ? target : path.resolve(tracker, target);
  if (!isInsideAllowed(abs, tracker)) {
    console.error(`Refusing to write outside the tracker: ${abs}`);
    process.exit(1);
  }
  result = setFrontmatterField(abs, 'status', status);
} else {
  // Issue id — mutate top-level settings.json
  const settingsPath = path.join(tracker, target, 'settings.json');
  if (!isInsideAllowed(settingsPath, tracker)) {
    console.error(`Refusing to write outside the tracker: ${settingsPath}`);
    process.exit(1);
  }
  result = setJsonField(settingsPath, 'status', status);
}

if (!result.ok) {
  console.error(result.message);
  process.exit(1);
}
console.log(result.message);
