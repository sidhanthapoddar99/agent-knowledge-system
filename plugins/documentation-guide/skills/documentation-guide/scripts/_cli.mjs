/**
 * _cli.mjs — the shared CLI contract for EVERY documentation-guide command.
 *
 * Before this file the arg-parser and help renderer lived inside issues/_lib.mjs
 * (reachable only by issues/*), while blog/config/docs/images hand-rolled their
 * own parsing three different ways. This is the single home for the contract:
 *   • parseArgs        — one flag/positional parser for all domains
 *   • printHelp        — usage renderer (see note on stdout vs stderr below)
 *   • emitJson         — uniform `--json` output
 *   • die / usageError — uniform exit-code scheme (0 ok · 1 error · 2 usage)
 *   • assertKnownFlags — opt-in unknown-flag rejection
 *   • reportAndExit    — re-exported from _check-lib so the contract has one
 *                        import surface
 *
 * Subtask 02 (this lift) is behavior-preserving: parseArgs/printHelp keep their
 * exact current semantics, and issues/_lib re-exports them so issues/* are
 * untouched. The contract NORMALIZATION (help→stdout, -h everywhere, --json
 * everywhere, exit codes) is rolled out in subtask 05, consuming these helpers.
 */

import { reportAndExit } from './_check-lib.mjs';

/**
 * Parse argv into `{ _: positionals, flags: {} }`.
 *   --key value | --key=value | --bare-flag (true)
 * A `--key` whose next token starts with `--` is treated as a bare boolean.
 * Single-dash tokens (e.g. `-h`) currently fall through to positionals — the
 * contract rollout (subtask 05) adds short-flag aliasing.
 */
export function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        args.flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next === undefined || next.startsWith('--')) {
          args.flags[key] = true;
        } else {
          args.flags[key] = next;
          i++;
        }
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

/**
 * Usage renderer. NOTE: prints to STDERR to preserve current behavior during
 * the lift (subtask 02). Subtask 05 flips this to STDOUT + `process.exit(0)` at
 * the call sites so `--help`/`-h` satisfy the uniform contract. Do not change
 * the stream here without doing the call-site rollout in the same change.
 */
export function printHelp(name, lines) {
  console.error(`Usage: docs-${name} ${lines[0]}\n`);
  for (const line of lines.slice(1)) console.error('  ' + line);
}

/** Uniform `--json` output: pretty JSON + trailing newline to stdout. */
export function emitJson(value) {
  process.stdout.write(JSON.stringify(value, null, 2) + '\n');
}

/** Exit with an error message (stderr) and code. Default 1 (error/no-match). */
export function die(message, code = 1) {
  if (message) console.error(message);
  process.exit(code);
}

/** Exit with a usage error: message to stderr, code 2. */
export function usageError(message) {
  if (message) console.error(message);
  process.exit(2);
}

/**
 * Opt-in unknown-flag rejection (the feature the hand-rolled loops had but
 * parseArgs lacked). Pass the set of recognized long-flag names; any other
 * `--flag` triggers a usage error. Not yet wired — adopted in subtask 05.
 */
export function assertKnownFlags(args, known) {
  const allowed = new Set(known);
  for (const k of Object.keys(args.flags)) {
    if (!allowed.has(k)) usageError(`Unknown flag: --${k}`);
  }
}

export { reportAndExit };
