/**
 * _cli.mjs — the shared CLI contract for EVERY agent-ks command.
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

import fs from 'node:fs';
import { reportAndExit } from './_check-lib.mjs';
import { MANIFEST, CONTRACT_FLAGS } from './_manifest.mjs';

/**
 * Write to stdout SYNCHRONOUSLY. process.stdout.write() is async on a pipe, so a
 * large write followed by process.exit() truncates — silently corrupting JSON an
 * agent is parsing. fs.writeSync(1, …) blocks until flushed, so the subsequent
 * process.exit() is safe. Use this for any bulk/structured output.
 */
export function writeStdout(str) {
  fs.writeSync(1, str);
}

/**
 * The flag names the RUNNING script is allowed to receive, from the manifest
 * entry whose `script` path it matches — or `null` when the script is not a
 * manifest command (a fixture, a self-test), in which case nothing is checked.
 *
 * Matching on `process.argv[1]` is what makes the check automatic: no call site
 * passes its own flag list, so no call site can forget to.
 */
function knownFlagNames() {
  const running = (process.argv[1] ?? '').replace(/\\/g, '/');
  if (!running) return null;
  const entry = MANIFEST.find((c) => c.script && running.endsWith(`/${c.script}`));
  if (!entry) return null;
  const names = new Set(['help', 'h']);
  for (const f of entry.flags ?? []) {
    names.add(f.name);
    if (f.alias) names.add(f.alias);
  }
  for (const f of CONTRACT_FLAGS ?? []) names.add(typeof f === 'string' ? f : f.name);
  return names;
}

/** Levenshtein distance, capped — only used to suggest a near-miss flag name. */
function editDistance(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/**
 * Parse argv into `{ _: positionals, flags: {} }`.
 *   --key value | --key=value | --bare-flag (true)
 * A `--key` whose next token starts with `--` is treated as a bare boolean.
 *
 * **AN UNRECOGNISED FLAG EXITS 2, IT IS NOT IGNORED.** Every filter flag here
 * NARROWS a result set, so a misspelled one returns a WIDER set that looks
 * exactly like a legitimate answer — no error, no warning, a plausible number.
 * `issue list --has-review-subtaks` used to report the whole tracker as needing
 * review. That is worse than a crash: it is a wrong answer nobody can spot.
 *
 * It also made every flag unverifiable by use — acceptance carried no
 * information, so the only way to learn whether `--include-closed` was real was
 * to run it twice and diff the counts.
 *
 * `agent-ks img` already behaved this way; this brings the rest in line.
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

  const known = knownFlagNames();
  if (known) {
    const unknown = Object.keys(args.flags).filter((f) => !known.has(f));
    if (unknown.length > 0) {
      for (const f of unknown) {
        const near = [...known]
          .map((k) => [k, editDistance(f, k)])
          .filter(([, d]) => d <= 3)
          .sort((x, y) => x[1] - y[1])[0];
        process.stderr.write(
          `agent-ks: unknown flag --${f}${near ? `  — did you mean --${near[0]}?` : ''}\n`,
        );
      }
      process.stderr.write(`Valid flags: ${[...known].sort().map((f) => `--${f}`).join(' ')}\n`);
      process.exit(2);
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
export function printHelp(subcommand, lines) {
  // `subcommand` is the full `agent-ks` path, e.g. 'issue list' or 'check issues'.
  console.error(`Usage: agent-ks ${subcommand} ${lines[0]}\n`);
  for (const line of lines.slice(1)) console.error('  ' + line);
}

/** Uniform `--json` output: pretty JSON + trailing newline to stdout (sync, so a
 *  large payload isn't truncated by a following process.exit()). */
export function emitJson(value) {
  writeStdout(JSON.stringify(value, null, 2) + '\n');
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
