# The `docs-*` command contract

Every command in this toolkit — whatever language it is written in — conforms to
one contract. The contract lives in **two places only**: the manifest
(`_manifest.mjs`, machine-readable) and **this file** (the human spec). It does
**not** live in JS helpers, so a command in Python (or any language) can conform
without importing anything from `scripts/`.

`cli.mjs` is the single dispatcher. It reads the manifest, routes a command to
its `script` using the entry's `runtime`, renders `--help` from the manifest, and
propagates the child's exit code. A conforming command only has to honor the
rules below.

## 1. Invocation & routing

- A command is one manifest entry: `{ bin, group, verb, category, script, runtime, summary, flags }`.
- It is reachable three ways, all routing to the same entry:
  - flat alias — `docs-list …` (the `bin`, collision-safe prefix, back-compat)
  - subcommand — `docs <group> <verb> …` (e.g. `docs issue list`)
  - top-level verb — `docs <verb> …` when `group` is null (e.g. `docs find`)
- `runtime` selects the launcher: `mjs` is imported in-process; any other
  registered runtime (e.g. `py`) is spawned through a detected interpreter with
  `stdio: 'inherit'`, and its exit code is propagated. The script receives its
  own args at the usual place (`process.argv[2:]` / `sys.argv[1:]`) — the
  group/verb/alias tokens are stripped by the dispatcher.

## 2. Argument grammar

- **Flags**: `--name value`, `--name=value`, or bare `--name` (boolean). A short
  alias may exist (`-q` for `--quality`); `-h` is always help.
- **Positionals**: everything not consumed by a flag, in order.
- **Unknown flags** may be rejected with a usage error (exit 2). Don't invent
  flags absent from the manifest entry.

## 3. Help (`--help` / `-h`)

- Handled centrally: `cli.mjs` intercepts `--help`/`-h` for every command and
  prints a manifest-generated detail view to **stdout**, exit **0**. A command
  does **not** implement its own `--help` (the lone exception is `docs-help`,
  which renders the full listing). This is why help is identical across
  languages — it never reaches the script.

## 4. Output

- **Human output** goes to **stdout**. Keep it line-oriented and tab-separated
  where it's tabular, so it pipes cleanly.
- **`--json`**: when a command returns data it MUST support `--json`, emitting a
  single valid JSON document (pretty-printed, trailing newline) to stdout and
  nothing else on stdout.
- **Diagnostics / errors / usage** go to **stderr**, never stdout — so `--json`
  consumers and pipes stay clean.
- **Large output + exit is a trap**: writing a big payload to stdout and then
  exiting can truncate it on a pipe (stdout is async). Write synchronously before
  exiting. In JS use `writeStdout()` (`fs.writeSync(1, …)`) from `_cli.mjs`; in
  other languages flush stdout before `exit`.

## 5. Exit codes

| Code | Meaning |
|---|---|
| `0` | success — for query commands, "found / non-empty result" |
| `1` | clean "no result" (no matches, nothing found) **or** a runtime error the command handled (git failure, file unreadable) |
| `2` | usage error — missing/invalid argument, unknown flag |
| `127` | dispatcher could not find the interpreter for the command's `runtime` |

Validators follow the same scheme: `0` clean, `1` problems found (CI-friendly).

## 6. Project context (for non-JS commands)

A command must NOT re-implement `.env` discovery. Call:

```
docs-resolve-context           # KEY=value lines (shell-sourceable)
docs-resolve-context --json    # { contentRoot, configDir, dataDir, envPath, envDir }
```

and read `CONTENT_ROOT` / `DATA_DIR` / `CONFIG_DIR` from it. This is the single
source of truth for where content lives, in both consumer and dogfood modes.

## 7. Adding a command

1. Add one entry to `MANIFEST` in `_manifest.mjs` (set `runtime`).
2. Put the script at `scripts/<entry.script>`.
3. Copy a `bin/<bin>` + `bin/<bin>.cmd` shim pair (generic — they pass their own
   filename through `cli.mjs`), or rely on the `docs <group> <verb>` form.
4. The self-test harness (`_selftest.mjs`) picks it up automatically from the
   manifest — it checks `--help`/`-h`/exit-0 and `--json` where applicable.

## 8. Polyglot readiness (status)

`cli.mjs` routes by `runtime` and detects a Python interpreter (`py -3` →
`python3` → `python`) exactly as it falls back bun → node, failing with exit
`127` and an actionable message when Python is absent (Python is **not**
guaranteed on Windows; bun/node is). No Python command ships today — this is the
forward-enabler so one can drop in later without touching the dispatcher.
