/**
 * _runtime.mjs — interpreter resolution for the polyglot dispatcher (subtask 13).
 *
 * The contract lives in the manifest + CONTRACT.md, NOT in JS helpers, so a
 * command can ship in any language. A manifest entry's `runtime` selects how
 * cli.mjs launches its `script`:
 *   • 'mjs' — imported in-process (the default; bun/node, guaranteed present).
 *   • 'py'  — spawned through a detected Python, mirroring the bun→node fallback.
 *
 * Python is NOT guaranteed on Windows (bun/node is), so detection is best-effort
 * and the dispatcher must fail gracefully with an actionable message when the
 * runtime is registered but its interpreter is absent.
 */

import { spawnSync } from 'node:child_process';

/**
 * Ordered interpreter candidates per runtime. Each candidate is a command line
 * split into [cmd, ...preargs]; the first whose `--version` probe succeeds wins.
 * `py -3` (the Windows Python launcher) is tried first because on Windows a bare
 * `python` may be a Store stub; then the POSIX `python3`, then `python`.
 */
export const INTERPRETERS = {
  py: ['py -3', 'python3', 'python'],
};

/** Probe a single candidate ("cmd arg…") for availability via --version. */
function probe(candidate) {
  const [cmd, ...preargs] = candidate.split(/\s+/);
  try {
    const r = spawnSync(cmd, [...preargs, '--version'], { stdio: 'ignore' });
    if (r.error) return null;            // ENOENT etc.
    if (r.status === 0) return { cmd, preargs };
  } catch { /* fall through */ }
  return null;
}

/**
 * Resolve a runtime to a launchable interpreter, or null if none is available.
 * Returns { cmd, preargs } so the caller spawns `cmd [...preargs] script …`.
 * 'mjs' returns null by design — it is handled in-process, never spawned.
 */
export function findInterpreter(runtime) {
  if (!runtime || runtime === 'mjs') return null;
  const candidates = INTERPRETERS[runtime];
  if (!candidates) return null;
  for (const c of candidates) {
    const hit = probe(c);
    if (hit) return hit;
  }
  return null;
}

/** True if the runtime is known to the dispatcher (even if not installed). */
export function isKnownRuntime(runtime) {
  return runtime === 'mjs' || Object.prototype.hasOwnProperty.call(INTERPRETERS, runtime);
}
