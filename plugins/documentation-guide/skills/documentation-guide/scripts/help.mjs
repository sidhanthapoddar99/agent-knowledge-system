/**
 * `docs help` — discovery command (Category 0b). All rendering is delegated to
 * _help-render.mjs (shared with cli.mjs's global --help interceptor).
 *
 *   docs help                 list every command grouped by domain
 *   docs help <command>       show one command's flags (bin or "group verb")
 *   docs help --json          machine-readable manifest dump (for agents)
 *
 * Honors the Category-0 contract: output to stdout, exit 0.
 */

import { parseArgs, emitJson } from './_cli.mjs';
import { manifestJson, renderCommandDetail, renderList, resolveEntry } from './_help-render.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.flags.json) {
  emitJson(manifestJson());
  process.exit(0);
}

// `-h` is not yet aliased by parseArgs (subtask 05 global fix lives in cli.mjs);
// drop help tokens so `docs help -h` shows the listing rather than treating it
// as a command name.
const positionals = args._.filter((t) => t !== '-h' && t !== '--help');

if (positionals[0]) {
  const entry = resolveEntry(positionals[0], positionals[1]);
  if (!entry) {
    console.error(`docs help: unknown command "${positionals.join(' ')}"`);
    process.exit(2);
  }
  console.log(renderCommandDetail(entry));
  process.exit(0);
}

console.log(renderList());
process.exit(0);
