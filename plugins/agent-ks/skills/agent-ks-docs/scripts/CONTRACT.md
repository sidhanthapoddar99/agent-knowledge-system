# The `agent-ks` command contract

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
- There is **one entrypoint on PATH**: the `agent-ks` dispatcher. A command is invoked as:
  - subcommand — `agent-ks <group> <verb> …` (e.g. `agent-ks issue list`)
  - top-level verb — `agent-ks <verb> …` when `group` is null (e.g. `agent-ks find`)
- The `bin` field (e.g. `docs-list`) is now an **internal identifier**, not a PATH binary — it keys the manifest, the harness, and `agent-ks help <bin>`. (A bare `docs` would collide with other tools, e.g. CUDA; `agent-ks` is prefix-namespaced and safe.)
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
  does **not** implement its own `--help` (the lone exception is the help
  command itself, `agent-ks help`, which renders the full listing). This is why help is identical across
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
agent-ks resolve-context           # KEY=value lines (shell-sourceable)
agent-ks resolve-context --json    # { contentRoot, configDir, dataDir, envPath, envDir }
```

and read `CONTENT_ROOT` / `DATA_DIR` / `CONFIG_DIR` from it. This is the single
source of truth for where content lives, in both consumer and dogfood modes.

## 7. Adding a command

1. Add one entry to `MANIFEST` in `_manifest.mjs` (set `runtime`).
2. Put the script at `scripts/<entry.script>`.
3. That's it for the surface — **no new shim**. The single `agent-ks` dispatcher
   resolves the new `<group> <verb>` from the manifest automatically.
4. The self-test harness (`_selftest.mjs`) picks it up automatically from the
   manifest — it checks `--help`/`-h`/exit-0 and `--json` where applicable.

## 8. Where a script lives — durable command vs one-shot migration

Two homes, one rule:

- **Durable, reusable capability → a `agent-ks` subcommand.** Add a manifest
  entry (§7) and put the script at `scripts/<group>/<verb>.<ext>`. It is invoked
  through the single `agent-ks` dispatcher (never on PATH directly), discoverable
  via `agent-ks help`, and covered by `_selftest.mjs`. Anything meant to be run
  more than once, by anyone, lives here.
- **One-shot, dated data migration → `migration/YYYY-MM-DD_<name>.py`.** Run
  directly by explicit path (`bun`/`python3 …/migration/<file>`), **not** a manifest
  entry and **not** on PATH. Must be idempotent with `detect` / `locate` / `migrate`
  / `verify` modes (see the repo-root `migration/` scripts for the reference shape) and
  is kept in place afterwards as the historical record of that change.

The line between them is *durable capability* vs *tied to one specific data change
at one point in time*. The `agent-ks-issues` skill ships **no** scripts of its own — all
executable logic lives here under `agent-ks-docs/` and is surfaced through the
one dispatcher, so there is exactly one place to look.

## 9. Polyglot readiness (status)

`cli.mjs` routes by `runtime` and detects a Python interpreter (`py -3` →
`python3` → `python`) exactly as it falls back bun → node, failing with exit
`127` and an actionable message when Python is absent (Python is **not**
guaranteed on Windows; bun/node is). No Python command ships today — this is the
forward-enabler so one can drop in later without touching the dispatcher.
