/**
 * Single dispatcher behind every bin/ wrapper (bash + .cmd).
 *
 * Invocation: <runtime> cli.mjs <token...> [args...]
 * Routing + all command metadata now live in _manifest.mjs (the single source
 * of truth). Each flat `bin/<name>` shim passes its own basename as the first
 * token; the `docs` subcommand form (`docs <group> <verb>`) resolves to the
 * same manifest entry. See _manifest.mjs → resolveCommand().
 *
 * Adding a command: add ONE entry to MANIFEST in _manifest.mjs, then copy a
 * bin/<name> + bin/<name>.cmd shim pair (or rely on the `docs` subcommand).
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MANIFEST, resolveCommand } from './_manifest.mjs';

const tokens = process.argv.slice(2);
const match = resolveCommand(tokens);

if (!match) {
  const bad = tokens[0] ?? '';
  console.error(`cli.mjs: unknown command "${bad}"`);
  console.error('known commands:');
  for (const c of MANIFEST) {
    const sub = c.group ? `${c.group} ${c.verb}` : c.verb;
    console.error(`  ${c.bin}  (docs ${sub})`);
  }
  process.exit(2);
}

const { entry, rest } = match;

// Future polyglot (subtask 13): non-mjs runtimes route to their interpreter.
if (entry.runtime && entry.runtime !== 'mjs') {
  console.error(`cli.mjs: runtime "${entry.runtime}" not yet supported for ${entry.bin}`);
  process.exit(2);
}

// Rebuild argv so the target script sees its own args at process.argv.slice(2),
// exactly as when invoked directly — whether reached via flat alias (drop 1
// token) or subcommand form (drop 2).
process.argv = [process.argv[0], process.argv[1], ...rest];

const here = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(here, entry.script)).href);
