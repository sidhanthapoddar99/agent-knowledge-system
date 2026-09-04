# The `agent-ks` command contract

Every command in this toolkit honours one contract, in any language. The contract lives in two places. The manifest `scripts/_manifest.mjs` is the copy machines read. This file is the copy people read. The contract does not live in JavaScript helpers. So a command in another language can follow it without importing anything from `scripts/`.

`scripts/cli.mjs` is the one dispatcher. A dispatcher is the program that receives every `agent-ks` call and starts the right script. It reads the manifest. It routes a command to its script by the entry's `runtime`. It renders `--help` from the manifest. It passes on the child's exit code. A command that follows the rules below conforms.

## 1. Invocation and routing

| Term | Meaning |
|---|---|
| Manifest entry | `{ bin, group, verb, category, script, runtime, summary, flags }` |
| `bin` | The internal id, e.g. `docs-list`. It keys the manifest, the self-test and `agent-ks help <bin>`. It is not a binary on PATH |
| `group` + `verb` | The documented form: `agent-ks issue list`. A `group` of `null` is a top-level verb: `agent-ks find` |
| `runtime` | How the dispatcher launches `script`. `mjs` is imported in-process. `py` is spawned through a detected interpreter |

The dispatcher strips the group and verb tokens. The script sees its own arguments at the usual place: `process.argv[2:]` in JavaScript, `sys.argv[1:]` in Python.

One name is on PATH: `agent-ks`. Every verb sits under that prefix, so a verb name cannot collide with another tool.

## 2. Argument grammar

| Form | Meaning |
|---|---|
| `--name value` or `--name=value` | A flag with a value |
| `--name` | A switch |
| `-x` | A one-letter alias, declared per flag. `-h` is always help |
| Everything else | A positional, in order |

A flag absent from the manifest entry is an error. The command exits 2 and lists the valid flags. Do not invent flags.

Enforcement comes from `parseArgs()` in `scripts/_cli.mjs`. A command that parses its own arguments does not get that enforcement. The six `check` verbs other than `issues` ignore an unknown flag and carry on. `move` and `img` reject it and exit 1 instead of 2. Route a new command through `parseArgs()`, so the manifest's flag list is the one that decides.

## 3. Help

`cli.mjs` intercepts `--help` and `-h` for every command. It prints the detail generated from the manifest to stdout, with exit 0. A command does not implement its own help. The one exception is `agent-ks help`, which renders the full listing itself. Help never reaches the script, so it is identical in every language.

## 4. Output

| Stream | Carries |
|---|---|
| stdout | Data and human output. Keep it line-oriented and tab-separated where it is tabular |
| stderr | Diagnostics, errors, usage and tips. Never data |

When a command returns data it must support `--json`. The output is one valid JSON document, pretty-printed, with a trailing newline. Nothing else goes to stdout.

Write a large output in full before you exit. When stdout is a pipe, a write does not finish at once. `process.exit()` right after a big write cuts it short. In JavaScript use `writeStdout()` from `scripts/_cli.mjs`. In another language, flush stdout before exit.

## 5. Exit codes

| Code | Meaning |
|---|---|
| `0` | Success. For a query: found, or a non-empty result. For a validator: clean |
| `1` | A clean "no result", or a runtime error the command handled: a git failure, an unreadable file. For a validator: problems found |
| `2` | Usage error: a missing or invalid argument, an unknown flag |
| `127` | The dispatcher found no interpreter for the command's `runtime` |

A new command follows this table. The shipped commands do not all follow it. The `issue` verbs, `check section` and `move` exit 1 on a missing argument, where the table asks for 2. When you branch on one of those, read the message, not the code.

## 6. Project context

A command must not search for `.env` on its own. Call `agent-ks resolve-context` and read `CONTENT_ROOT`, `DATA_DIR` and `CONFIG_DIR` from its output. `--json` returns `{ contentRoot, configDir, dataDir, envPath, envDir }`. This is the one source for where content lives, in consumer mode and in dogfood mode.

## 7. Adding a command

1. Add one entry to `MANIFEST` in `scripts/_manifest.mjs`. Set `runtime`.
2. Put the script at `scripts/<entry.script>`.
3. Run `bun scripts/_selftest.mjs`. It reads the manifest. It checks the new command's `--help`, `-h` and `--json`. You do not change the self-test for that. It does not check the exit codes in section 5, so test those by hand.
4. Add the command and its flags to [cli-toolkit.md](./cli-toolkit.md).

No shim is needed. The dispatcher resolves the new `<group> <verb>` from the manifest.

## 8. Where a script lives

| Kind of script | Home | Run as |
|---|---|---|
| A durable, reusable command | A manifest entry and `scripts/<group>/<verb>.<ext>` | `agent-ks <group> <verb>`; listed by `help`; covered by the self-test |
| A one-shot content migration | The repo root `migration/<to-version>_<statement>.py` | By explicit path, with `detect`, `locate`, `migrate` and `verify` modes |

A command is a tool that anyone runs more than once. A migration is a change tied to one content-format version. A migration script stays in place after it runs, as the record of that change. A migration script is idempotent. That means you can run it twice on the same tree, and the second run changes nothing. Its `verify` mode proves that.

All executable logic of the plugin lives in this skill's `scripts/`. The other skills ship prose only.

## 9. Interpreters

The dispatcher detects an interpreter per `runtime`. For `py` it tries `py -3`, then `python3`, then `python`. It takes the first one that answers `--version`. When none answers, it exits 127 with an install hint. Python is not guaranteed on Windows. `bun` is required everywhere.
