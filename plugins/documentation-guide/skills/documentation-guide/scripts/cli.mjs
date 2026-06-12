/**
 * Single dispatcher behind every bin/ wrapper (bash + .cmd).
 *
 * Invocation: node cli.mjs <command-name> [args...]
 * Each wrapper passes its own basename as <command-name>, so the
 * command → script routing lives only in the COMMANDS map below.
 *
 * Adding a new CLI: add one entry here, then copy any existing
 * bin/<name> + bin/<name>.cmd pair under the new name (shim bodies
 * are identical — they self-route via their filename).
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COMMANDS = {
  'docs-list':          'issues/list.mjs',
  'docs-show':          'issues/show.mjs',
  'docs-subtasks':      'issues/subtasks.mjs',
  'docs-agent-logs':    'issues/agent-logs.mjs',
  'docs-set-state':     'issues/set-state.mjs',
  'docs-add-comment':   'issues/add-comment.mjs',
  'docs-add-agent-log': 'issues/add-agent-log.mjs',
  'docs-review-queue':  'issues/review-queue.mjs',
  'docs-check-blog':    'blog/check.mjs',
  'docs-check-config':  'config/check.mjs',
  'docs-check-section': 'docs/check.mjs',
  'docs-move':          'docs/move.mjs',
};

const name = process.argv[2];
const script = COMMANDS[name];

if (!script) {
  console.error(`cli.mjs: unknown command "${name ?? ''}"`);
  console.error('known commands:');
  for (const cmd of Object.keys(COMMANDS)) console.error(`  ${cmd}`);
  process.exit(2);
}

// Drop the command name so target scripts see process.argv.slice(2)
// as their own args, exactly as when they were invoked directly.
process.argv.splice(2, 1);

const here = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(here, script)).href);
