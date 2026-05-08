---
title: "Plugin upgrade overview — what changes, what stays"
sidebar_label: "01 · Overview"
---

# documentation-guide plugin upgrade — overview

Once the Go binary ships, the `documentation-guide` Claude Code plugin needs to evolve. This note captures the scope of that change. Companion notes break down the subcommand migration and skill/reference updates.

## What's there today

The plugin lives at `plugins/documentation-guide/` and contains:

1. **The skill** — `skills/documentation-guide/SKILL.md` — triages docs/issue/blog/config tasks to one of five reference files (`writing.md`, `docs-layout.md`, `blog-layout.md`, `issue-layout.md`, `settings-layout.md`).

2. **11 bash wrappers** in `bin/` that exec `.mjs` scripts via `bun`:
   - Issue tracker: `docs-list`, `docs-show`, `docs-subtasks`, `docs-agent-logs`, `docs-set-state`, `docs-add-comment`, `docs-add-agent-log`, `docs-review-queue`
   - Validators: `docs-check-blog`, `docs-check-config`, `docs-check-section`

3. **2 slash commands**:
   - `/docs-init` — bootstrap a new documentation-template project
   - `/docs-add-section` — scaffold a new top-level section

4. **5 reference files** under `skills/documentation-guide/references/` — `writing.md`, `docs-layout.md`, `blog-layout.md`, `issue-layout.md`, `settings-layout.md`.

5. **Backing scripts** under `skills/documentation-guide/scripts/` — `.mjs` files that the bash wrappers exec.

## What changes after migration

| Today | After binary ships | Why |
|---|---|---|
| `docs-list ...` (bash → bun → list.mjs) | `doc-engine docs list ...` (single Go binary) | Native subcommand; no bun dep; faster startup; works in CI |
| 11 bash wrappers in `bin/` | Deleted; subcommands of `doc-engine` | One binary, one PATH entry, one toolchain |
| `bun` required on PATH for plugin | Just `doc-engine` on PATH | End-user simplification |
| Claude Code adds `bin/` to PATH | Still does (for slash commands) but bash wrappers are gone | No-op once wrappers are deleted |
| `.mjs` scripts under `skills/.../scripts/` | Deleted; logic ported to Go | Single source of truth |
| 5 reference files | **Unchanged** in content; minor command renames inline | Spec doesn't change, command syntax does |
| 2 slash commands (`/docs-init`, `/docs-add-section`) | Stay as slash commands; can call `doc-engine` internally | These are user-facing chat commands, not CLI |
| SKILL.md triage logic | Updated to mention `doc-engine docs ...` instead of `docs-...` | Same triage decisions, new commands |

## What stays unchanged

- The triage decision tree in SKILL.md (which reference file matches which task)
- The 5 reference files' *content* (writing rules, layout rules, settings schema)
- The 2 slash commands' purpose + UX (interactive scaffolding)
- The fundamental skill philosophy (eager triage on docs work, route to references)

## Plan at a glance

1. **Pre-migration:** plugin keeps working as-is. No changes until the binary lands.
2. **Phase A (binary ships v1):** add subcommands to the Go binary. Bash wrappers in plugin still work; both code paths exist for one release.
3. **Phase B (deprecation):** plugin's bash wrappers print a deprecation warning and forward to `doc-engine docs <subcommand>`. SKILL.md updated to recommend the new form.
4. **Phase C (removal):** delete `bin/` from plugin. Delete `.mjs` scripts. Plugin contains only SKILL.md, references, and slash commands.

The plugin gets *thinner* (less code to maintain), and Claude/users get the same UX with a single dependency (`doc-engine` binary instead of `bun + bash + plugin`).

## What this unlocks

- Plugin works in environments where Claude Code isn't running (CI, scripts, terminals). Today the wrappers technically work outside Claude Code but require Bun on PATH; after migration just the binary is needed.
- Validators can be wired into pre-commit hooks easily: `doc-engine docs check-section default-docs/data/user-guide`.
- New tracker commands can be added without bash-script ceremony — just a new Cobra subcommand in Go.
- Schema validation can leverage compile-time types in Go (today the `.mjs` scripts duplicate schema knowledge).

## Companion notes

- **`02_subcommand-migration.md`** — the 11 wrappers' command-line surface mapped to `doc-engine docs <verb>` form.
- **`03_skill-and-references.md`** — SKILL.md updates and reference file edits required.
