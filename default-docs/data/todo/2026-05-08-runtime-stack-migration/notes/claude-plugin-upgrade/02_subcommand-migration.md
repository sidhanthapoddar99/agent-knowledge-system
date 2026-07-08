---
title: "Subcommand migration — 11 wrappers → doc-engine subcommands"
sidebar_label: "02 · Subcommand migration"
---

# Subcommand migration — the 11 wrappers

Direct mapping of today's bash wrappers to the proposed `doc-engine docs ...` subcommand surface. Sticking close to the existing semantics so Claude / users can re-learn just the prefix.

## The mapping

| Today | After migration | Notes |
|---|---|---|
| `docs-list [filters] [--search regex]` | `doc-engine docs list [filters] [--search regex]` | Identical flags |
| `docs-show <id> [--full] [--json]` | `doc-engine docs show <id> [--full] [--json]` | Identical |
| `docs-subtasks <id> \| --all` | `doc-engine docs subtasks <id> \| --all` | Identical |
| `docs-agent-logs <id> [--limit N]` | `doc-engine docs agent-logs <id> [--limit N]` | Identical |
| `docs-set-state <id> [<subtask>] <state>` | `doc-engine docs set-state <id> [<subtask>] <state>` | Identical |
| `docs-add-comment <id> --author X "..."` | `doc-engine docs add-comment <id> --author X "..."` | Identical |
| `docs-add-agent-log <id> --agent X "..."` | `doc-engine docs add-agent-log <id> --agent X "..."` | Identical |
| `docs-review-queue` | `doc-engine docs review-queue` | Identical |
| `docs-check-blog <path>` | `doc-engine docs check blog <path>` | Verb-grouped under `check` |
| `doc-check-config <path>` | `doc-engine docs check config <path>` | Verb-grouped under `check` |
| `docs-check-section <path>` | `doc-engine docs check section <path>` | Verb-grouped under `check` |

Plus new convenience aliases:
- `doc-engine list` (no `docs` prefix needed when in a docs project)
- `doc-engine show <id>`
- `doc-engine check` (runs all three checkers)

## Why group `check-*` under `check`

Today's three validators (`docs-check-blog`, `docs-check-config`, `docs-check-section`) are conceptually one tool with a target argument. Grouping them under a `check` subcommand:

- Reduces command surface (`check blog`, `check config`, `check section`)
- Allows a `check all` aggregator
- Lets `--quiet` / `--verbose` / `--strict` flags apply uniformly across all three
- Matches the tracker's existing grouping in CLAUDE.md ("Validators (exit `0` clean / `1` on errors)")

## Cobra command tree

```
doc-engine
├── serve [flags]
├── dev [flags]
├── build [flags]
├── init
├── upgrade
├── version
└── docs
    ├── list [filters] [--search regex]
    ├── show <id> [--full] [--json]
    ├── subtasks <id|--all>
    ├── agent-logs <id> [--limit N]
    ├── set-state <id> [<subtask>] <state>
    ├── add-comment <id> --author X "<body>"
    ├── add-agent-log <id> --agent X "<body>"
    ├── review-queue
    └── check
        ├── blog <path>
        ├── config <path>
        ├── section <path>
        └── all <project-root>
```

## Backwards compat (Phase B)

For one release after the binary ships, the plugin's bash wrappers stay but become thin forwarders:

```bash
#!/usr/bin/env bash
# bin/docs-list (deprecated)
echo "warning: docs-list is deprecated; use 'doc-engine docs list'" >&2
exec doc-engine docs list "$@"
```

Once SKILL.md and the user-guide are updated and at least one minor release has passed, delete the wrappers entirely (Phase C).

## Validator schema port

The three validators today read framework loaders (`config.ts`, `theme.ts`, content-type schemas). In Go, they read the same Go modules directly — no shell-out, no `.mjs` cache, no schema duplication. Faster (~5–10× speedup expected) and structurally cleaner.

The validation rules themselves (canonical key sets, required frontmatter, XX_ prefix enforcement, etc.) port verbatim from the existing `.mjs` scripts.

## JSON output stability

Several wrappers support `--json` for AI consumption. The Go output **must** match the existing JSON schema byte-for-byte (modulo formatting whitespace). This is a hard contract — Claude depends on the schema during agent loops.

Snapshot tests against the existing `.mjs` scripts' output across a fixture corpus is the safest way to lock parity.

## Performance expectations

| Operation | Today (bash → bun → mjs) | Go subcommand | Improvement |
|---|---|---|---|
| `docs-list` (12 issues) | ~250 ms | ~5 ms | 50× |
| `docs-show <id>` | ~200 ms | ~5 ms | 40× |
| `docs-check-blog` | ~600 ms | ~20 ms | 30× |
| `docs-check-section` (large) | ~1.5 s | ~40 ms | 35× |

Most of the speedup is bun startup tax (~150 ms per invocation). Go binaries have ~1 ms cold start. For Claude calling these 50× in a session, the cumulative time saved is ~10 s.

## What survives Phase C deletion

After full migration, the plugin folder shrinks to:

```
plugins/documentation-guide/
├── plugin.json
├── README.md
├── commands/                   ← slash commands
│   ├── docs-init.md
│   └── docs-add-section.md
└── skills/
    └── agent-ks-docs/
        ├── SKILL.md            ← updated
        └── references/
            ├── writing.md
            ├── docs-layout.md
            ├── blog-layout.md
            ├── issue-layout.md
            └── settings-layout.md
```

No `bin/`, no `scripts/`. Plugin is now pure Claude Code surface (skill + slash commands + references); all the executable logic lives in the binary.
