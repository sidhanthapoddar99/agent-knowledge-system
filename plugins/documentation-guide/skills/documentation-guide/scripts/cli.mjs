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
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MANIFEST, resolveCommand } from './_manifest.mjs';
import { renderCommandDetail } from './_help-render.mjs';
import { findInterpreter, isKnownRuntime } from './_runtime.mjs';

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

// Category-0 contract (subtask 05): a global --help/-h interceptor. Because every
// command routes through here, handling help centrally gives EVERY command a
// uniform `--help`/`-h` → stdout, exit 0 — generated from the manifest — without
// touching each script. The `help` command itself renders the full listing, so
// let it through to its own handler.
if (entry.bin !== 'docs-help' && rest.some((a) => a === '--help' || a === '-h')) {
  process.stdout.write(renderCommandDetail(entry) + '\n');
  process.exit(0);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(here, entry.script);

// Polyglot dispatch (subtask 13): a manifest entry's `runtime` decides how its
// `script` launches. 'mjs' is imported in-process below; any other registered
// runtime is spawned through a detected interpreter (mirrors bun→node fallback),
// forwarding argv and propagating the child's exit code. The contract (arg
// grammar, --json, exit codes) lives in the manifest + CONTRACT.md, so a Python
// command conforms without touching this dispatcher.
if (entry.runtime && entry.runtime !== 'mjs') {
  if (!isKnownRuntime(entry.runtime)) {
    console.error(`cli.mjs: unknown runtime "${entry.runtime}" for ${entry.bin}`);
    process.exit(2);
  }
  const interp = findInterpreter(entry.runtime);
  if (!interp) {
    console.error(`cli.mjs: ${entry.bin} needs a "${entry.runtime}" interpreter, none found on PATH.`);
    if (entry.runtime === 'py') console.error('  Install Python 3 (py -3 / python3 / python). It is not bundled like bun/node.');
    process.exit(127);
  }
  const res = spawnSync(interp.cmd, [...interp.preargs, scriptPath, ...rest], { stdio: 'inherit' });
  if (res.error) { console.error(`cli.mjs: failed to launch ${interp.cmd}: ${res.error.message}`); process.exit(127); }
  process.exit(res.status ?? 1);
}

// Rebuild argv so the target script sees its own args at process.argv.slice(2),
// exactly as when invoked directly — whether reached via flat alias (drop 1
// token) or subcommand form (drop 2).
process.argv = [process.argv[0], process.argv[1], ...rest];

await import(pathToFileURL(scriptPath).href);
