---
title: Bin Wrappers
description: The bin/ pattern — auto-PATH augmentation, executable scripts, and why bin beats slash commands and ${CLAUDE_PLUGIN_ROOT} for shell tooling
---

# Bin Wrappers

The `bin/` folder is the cleanest way to expose plugin-bundled scripts to the model. Better than slash commands, better than `${CLAUDE_PLUGIN_ROOT}` interpolation, better than embedding paths inside skill bodies. This is the practical workhorse pattern for shipping CLI tooling in a plugin.

## Why it works

At session start, Claude Code adds **every installed plugin's `bin/` folder** to the bash `$PATH`. Verified live:

```bash
$ env | grep CLAUDE_PLUGIN_ROOT
CLAUDE_PLUGIN_ROOT=          # empty in regular tool-call shells

$ echo $PATH | tr ':' '\n' | grep claude
/home/you/.claude/plugins/cache/claude-plugins-official/pyright-lsp/1.0.0/bin
/home/you/.claude/plugins/cache/claude-plugins-official/ralph-loop/1.0.0/bin
/home/you/.claude/plugins/cache/claude-plugins-official/skill-creator/unknown/bin
/home/you/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.1.4/bin
…
```

That means the model can invoke any wrapper by its bare name — no path knowledge required:

```bash
docs-guide issue list --priority high
```

resolves to `~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.3.0/bin/docs-guide` automatically.

## Wrapper template

A wrapper is just an executable shell script. As a toolkit grows past a handful of commands, the cleanest pattern is a **single generic shim** routed through one dispatcher — every wrapper is byte-identical except its filename, and it passes its own basename through to a central `cli.mjs`. Real example from `documentation-guide`:

```bash
#!/usr/bin/env bash
# Generic shim — routes via its own filename through the shared cli.mjs dispatcher.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI="$DIR/../skills/documentation-guide/scripts/cli.mjs"
if command -v bun >/dev/null 2>&1; then
  exec bun "$CLI" "$(basename "$0")" "$@"
else
  exec node "$CLI" "$(basename "$0")" "$@"
fi
```

Three things going on:

1. `$(dirname "${BASH_SOURCE[0]}")` resolves the wrapper's own location — the wrapper finds itself, which is the only path resolution that reliably works for plugin-bundled assets in shell context.
2. `$(basename "$0")` passes the wrapper's own name (e.g. `docs-list`) as the first token; the dispatcher maps that to the right implementation script via the manifest (see below).
3. `bun` if available, fall back to `node` — keeps the plugin usable on machines without bun.

`chmod +x` the file, drop it in `bin/`, and the model can run it as `<wrapper-name>` after the next `/reload-plugins`. Ship a `.cmd` twin (same logic in batch) for native Windows `cmd`/PowerShell.

> Earlier, simpler toolkits pointed each wrapper *directly* at its implementation script (`SCRIPT="$DIR/../.../issues/list.mjs"`). That still works for one-off scripts, but once you have many commands the single-dispatcher form below removes per-wrapper drift — the wrapper carries no knowledge except its own name.

## Single-dispatcher architecture (manifest-driven)

`documentation-guide` ships ~28 commands behind one dispatcher. The design has three parts:

- **`scripts/_manifest.mjs`** — the single source of truth. One array entry per command: `{ bin, group, verb, category, script, runtime, summary, flags }`. Nothing else hard-codes the command list.
- **`scripts/cli.mjs`** — the dispatcher. It resolves the incoming tokens against the manifest, intercepts `--help`/`-h` centrally (rendered *from* the manifest, so help can't drift from reality), routes to the entry's `script` according to its `runtime`, and rebuilds `argv` so the target script sees its own args.
- **`scripts/_cli.mjs`** — the shared contract helpers (`parseArgs`, `emitJson`, `writeStdout`, exit-code helpers) every command imports, so arg parsing, `--json`, and exit codes are uniform. The contract is written down in `scripts/CONTRACT.md`.

There is a **single shim on PATH** — `docs-guide` (plus its `.cmd` twin) — which forwards `"$@"` verbatim to the dispatcher. Every command is invoked as `docs-guide <group> <verb>` (e.g. `docs-guide issue list`). The manifest `bin` field (`docs-list`) survives only as an internal identifier — it keys the manifest, the harness, and `docs-guide help docs-list`, but is **not** a binary on PATH.

> An earlier iteration shipped a flat `docs-*` shim per command (28 of them) *plus* the dispatcher — two ways to call everything. That was collapsed to the single `docs-guide` entrypoint: the per-command shims were pure clutter once the dispatcher existed, and a bare `docs` dispatcher collides (see Naming hygiene). One prefixed dispatcher is the whole surface.

### Adding a command

1. Add **one** entry to `MANIFEST` in `_manifest.mjs` (set `runtime: 'mjs'`, or another language — see below).
2. Put the implementation at `scripts/<entry.script>`, importing the shared contract from `_cli.mjs`.
3. **No new shim** — the single `docs-guide` dispatcher resolves the new `<group> <verb>` from the manifest automatically.
4. The self-test harness reads the manifest, so it picks up the new command automatically (`--help`/`-h`/exit-0, and `--json` where applicable).

## Why bin beats the alternatives

### vs `${CLAUDE_PLUGIN_ROOT}` in `SKILL.md`

`${CLAUDE_PLUGIN_ROOT}` does **not** expand inside skill markdown bodies. Verified empirically — the env var is empty in normal tool-call shells. Writing `bun ${CLAUDE_PLUGIN_ROOT}/scripts/foo.mjs` in a SKILL.md fails because the variable substitutes to empty string. The model ends up running `bun /scripts/foo.mjs`, which doesn't exist.

| Where `${CLAUDE_PLUGIN_ROOT}` works | Where it doesn't |
|---|---|
| `commands/<name>.md` body | `SKILL.md` body |
| `commands/<name>.md` `allowed-tools` frontmatter | Bash tool calls written by the model |
| `hooks/hooks.json` command strings | Shell scripts in `scripts/` |

Anything that runs as a normal shell command needs a different strategy. `bin/` wrappers are that strategy.

### vs slash commands

Slash commands are a great UX for templated *prompts* — they expand into instructions for the model. They're a clunky UX for "just run this script and give me the output." Slash commands carry a per-invocation prompt overhead; bin wrappers are a single Bash tool call.

| Use case | Use |
|---|---|
| "Bootstrap a new project" (interactive Q&A) | Slash command |
| "Run `docs-guide issue list` and filter by priority" (one shell call) | Bin wrapper |
| "Validate the docs config" (binary pass/fail) | Bin wrapper |

### vs hand-authored wrappers in user scope

You could hand-author the same wrappers in `~/.claude/bin/` — but then there's nothing to ship to consumers. Bin wrappers in a plugin let you distribute the tooling once and have it work across every project the plugin is installed in.

## Naming hygiene

**Always prefix wrappers with your plugin's namespace.** If five plugins each ship a `list` wrapper, they collide on PATH (whichever loads first wins). The `documentation-guide` plugin uses `docs-` for everything: `docs-list`, `docs-show`, `docs-check-section`, etc.

Rules of thumb:

- Pick a 3-5 character prefix tied to your plugin (`docs-`, `lint-`, `gh-`)
- Use kebab-case (`docs-add-comment`, not `docs_add_comment` or `docsAddComment`)
- Don't shadow common system commands (`ls`, `cd`, `git`, `npm`)
- Don't shadow common dev tools (`jq`, `yq`, `rg`)

> **Worked example — why the dispatcher is named `docs-guide`, not `docs`.** A subcommand toolkit wants a single short entrypoint, and bare `docs` is the obvious pick — but `docs` is *not* prefix-namespaced, and other tools ship one (e.g. NVIDIA CUDA puts a `docs` on PATH; in WSL the Windows paths often sort *ahead* of the plugin's bin dir, so CUDA's wins and the toolkit becomes unreachable by name). The fix is to keep the dispatcher name prefixed too: `documentation-guide` ships **`docs-guide`**, which is collision-safe by the same rule as `docs-list` was. Lesson: the namespace prefix applies to the dispatcher, not just the per-command wrappers.

## What goes in the wrapper

Keep wrappers thin. They should:

1. Locate themselves (`$(dirname "${BASH_SOURCE[0]}")`)
2. Resolve the bundled implementation script
3. `exec` into the implementation (don't fork; you want the wrapper to be transparent)

The actual logic lives in the bundled script under `skills/<name>/scripts/` (or wherever you put it). The wrapper is the PATH-friendly handle, not the implementation.

If you need to install dependencies or do environment setup, do it in the implementation script, not the wrapper. Wrappers should never bring up a heavy runtime they don't need.

## Multi-runtime fallback

Plugins ship `.mjs` (Node), `.py` (Python), or `.sh` (Bash) implementations. With the single-dispatcher pattern the wrapper stays runtime-agnostic — the **manifest entry's `runtime` field** decides how the dispatcher launches each command, so one shim serves commands written in different languages:

```js
// in cli.mjs, after resolving the manifest entry:
if (entry.runtime && entry.runtime !== 'mjs') {
  const interp = findInterpreter(entry.runtime);   // e.g. 'py' → py -3 → python3 → python
  if (!interp) { /* exit 127 with an actionable "interpreter not found" message */ }
  spawnSync(interp.cmd, [...interp.preargs, scriptPath, ...rest], { stdio: 'inherit' });
}
```

Interpreter detection mirrors the bun→node fallback: try ordered candidates, probe `--version`, use the first that works. Python is **not** guaranteed on Windows (bun/node is), so a registered-but-missing interpreter should fail with a clear message (exit `127`), never a cryptic crash. Don't try to bootstrap installations from inside the wrapper.

This keeps the toolkit polyglot-ready: a Python command drops in by adding a manifest entry with `runtime: 'py'` and a `.py` script that honours the same contract (`scripts/CONTRACT.md`) — no dispatcher changes. Non-JS scripts get the project's content root via `docs-guide resolve-context` (`--json`) instead of re-implementing `.env` discovery.

## Verifying after install

```bash
# Should resolve to your plugin's cache bin folder
which docs-guide

# Should run and return output
docs-guide --help
```

If the wrapper isn't on PATH after `/reload-plugins`:

- Check `chmod +x bin/*` — wrappers need execute permission
- Check the file actually starts with `#!/usr/bin/env bash` (or your interpreter)
- Check `/reload-plugins` output for any plugin load errors
- Check `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/bin/` exists with your wrappers

## See also

- **[Capabilities](./03_capabilities.md)** — the five "real" capability types (skills, commands, agents, hooks, MCP)
- **[Plugin Structure](./02_plugin-structure.md)** — where `bin/` fits in the plugin folder layout
- **[Testing and Benchmarking](./05_testing-and-benchmarking.md)** — iterating on wrappers during development
