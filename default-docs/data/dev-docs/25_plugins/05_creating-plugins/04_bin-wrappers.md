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
/home/you/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.1.3/bin
…
```

That means the model can invoke any wrapper by its bare name — no path knowledge required:

```bash
docs-list --priority high
```

resolves to `~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.1.3/bin/docs-list` automatically.

## Wrapper template

A wrapper is just an executable shell script. Real example from `documentation-guide`:

```bash
#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$DIR/../skills/documentation-guide/scripts/issues/list.mjs"
if command -v bun >/dev/null 2>&1; then
  exec bun "$SCRIPT" "$@"
else
  exec node "$SCRIPT" "$@"
fi
```

Three things going on:

1. `$(dirname "${BASH_SOURCE[0]}")` resolves the wrapper's own location — the wrapper finds itself, which is the only path resolution that reliably works for plugin-bundled assets in shell context.
2. `SCRIPT` is built relative to the wrapper, pointing at the bundled implementation script.
3. `bun` if available, fall back to `node` — keeps the plugin usable on machines without bun.

`chmod +x` the file, drop it in `bin/`, and the model can run it as `<wrapper-name>` after the next `/reload-plugins`.

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
| "Run `docs-list` and filter by priority" (one shell call) | Bin wrapper |
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

## What goes in the wrapper

Keep wrappers thin. They should:

1. Locate themselves (`$(dirname "${BASH_SOURCE[0]}")`)
2. Resolve the bundled implementation script
3. `exec` into the implementation (don't fork; you want the wrapper to be transparent)

The actual logic lives in the bundled script under `skills/<name>/scripts/` (or wherever you put it). The wrapper is the PATH-friendly handle, not the implementation.

If you need to install dependencies or do environment setup, do it in the implementation script, not the wrapper. Wrappers should never bring up a heavy runtime they don't need.

## Multi-runtime fallback

Most plugins ship `.mjs` (Node), `.py` (Python), or `.sh` (Bash) implementations. The runtime check pattern:

```bash
# Node, with bun preferred
if command -v bun >/dev/null 2>&1; then
  exec bun "$SCRIPT" "$@"
else
  exec node "$SCRIPT" "$@"
fi

# Python, prefer python3
if command -v python3 >/dev/null 2>&1; then
  exec python3 "$SCRIPT" "$@"
else
  exec python "$SCRIPT" "$@"
fi
```

If neither is available, the script will fail with a clear error from the runtime — that's the right behaviour. Don't try to bootstrap installations from inside the wrapper.

## Verifying after install

```bash
# Should resolve to your plugin's cache bin folder
which docs-list

# Should run and return output
docs-list --help
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
