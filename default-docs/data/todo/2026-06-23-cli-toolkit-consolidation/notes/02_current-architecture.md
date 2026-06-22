---
title: "Current CLI architecture — why a refactor is cheap"
---

# Current CLI architecture — why a refactor is cheap

The concern was "this has a lot of references / JavaScript — can it even be refactored?" The answer is **yes, and cheaply**, because the reference surface is small and centralized.

## How it's wired

```
plugins/documentation-guide/
├── bin/<name>            ← bash shim   (+ <name>.cmd for native Windows)
│                            generic: self-routes via its own basename
└── skills/documentation-guide/scripts/
    ├── cli.mjs           ← the ONLY router: a 13-line COMMANDS map
    ├── _env.mjs · _check-lib.mjs · _order-prefix.mjs   ← shared libs
    ├── issues/           ← list, show, subtasks, agent-logs, set-state,
    │                        add-comment, add-agent-log, review-queue, check*, _lib
    ├── blog/check.mjs
    ├── config/check.mjs
    ├── docs/check.mjs · docs/move.mjs
    └── images/optimize.mjs · images/_lib
```

`* issues/check.mjs` exists but is **not** in the `COMMANDS` map — orphaned.

## Why the blast radius is small

1. **Routing is one place.** `cli.mjs` holds a single `COMMANDS` map: `command-name → script path`. Nothing else routes.
2. **Shims are generic.** Each `bin/<name>` execs `cli.mjs` with its own basename — the body is identical across all 13. Adding a command = add a map entry + copy a shim pair. The `.cmd` twins mirror the bash shims.
3. **Scripts are already domain-foldered.** `issues/`, `blog/`, `docs/`, `config/`, `images/` with shared `_*.mjs` libs. New per-type scripts (`docs/list.mjs`, `blog/list.mjs`, …) fit the existing shape.
4. **Scripts don't reference each other by CLI name.** They import via relative paths and shared `_lib`. So renames/regroupings **don't ripple into the JS** — only the map, the `bin/` folder, and the docs (CLAUDE.md + skill `.md`) change.
5. **The dispatcher already reads `argv[2]` as the command.** Extending to `docs <group> <verb>` subcommands is a few lines of parsing, not a rewrite.

## Reference surface to touch in any refactor

- `skills/documentation-guide/scripts/cli.mjs` — the `COMMANDS` map.
- `bin/` — shim pairs (mechanical copy/rename).
- `CLAUDE.md` (root) + `skills/documentation-guide/SKILL.md` + the issues reference tables — the human-facing command lists.
- The framework's bundled user-guide CLI catalogue, if it lists these.
