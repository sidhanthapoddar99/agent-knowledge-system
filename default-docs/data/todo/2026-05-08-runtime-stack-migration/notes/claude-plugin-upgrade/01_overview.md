---
title: "Plugin upgrade overview — what changes, what stays"
sidebar_label: "01 · Overview"
---

# documentation-guide plugin upgrade — overview

Once the Go binary ships, the `documentation-guide` Claude Code plugin needs to evolve. This note captures the scope of that change. Companion notes break down the subcommand migration and skill/reference updates.

## What's there today

The plugin lives at `plugins/documentation-guide/` and contains:

1. **3 skills** — `agent-ks-docs` (triages docs/blog/config tasks to reference files: `writing.md`, `docs-layout.md`, `blog-layout.md`, `settings-layout.md`, `images.md`), `agent-ks-issues` (self-contained issue tracker), `agent-ks-artifacts` (HTML artifacts).

2. **One dispatcher shim** in `bin/` — `agent-ks` (+ `.cmd` twin) — which execs `cli.mjs` via `bun` (node fallback); ~28 commands resolve as `agent-ks <group> <verb>` from a manifest (`_manifest.mjs`).

3. **2 slash commands**:
   - `/docs-init` — bootstrap a new agent-knowledge-system project
   - `/docs-add-section` — scaffold a new top-level section

4. **Reference files** under each skill's `references/`.

5. **Backing scripts** under `skills/agent-ks-docs/scripts/` — `.mjs` files the dispatcher routes to.

## What changes after migration

| Today | After binary ships | Why |
|---|---|---|
| `agent-ks issue list ...` (bash shim → bun → cli.mjs → list.mjs) | `doc-engine issue list ...` (single Go binary) | Native subcommand; no bun dep; faster startup; works in CI |
| `agent-ks` shim in `bin/` | Deleted; `doc-engine` carries the same `<group> <verb>` surface | One binary, one PATH entry, one toolchain |
| `bun` required on PATH for plugin | Just `doc-engine` on PATH | End-user simplification |
| Claude Code adds `bin/` to PATH | Still does (for slash commands) but the shim is gone | No-op once the shim is deleted |
| `.mjs` scripts under `skills/.../scripts/` | Deleted; logic ported to Go | Single source of truth |
| Reference files | **Unchanged** in content; minor command renames inline | Spec doesn't change, command syntax does |
| 2 slash commands (`/docs-init`, `/docs-add-section`) | Stay as slash commands; can call `doc-engine` internally | These are user-facing chat commands, not CLI |
| SKILL.md triage logic | Updated to mention `doc-engine ...` instead of `agent-ks ...` | Same triage decisions, new commands |

> The dispatcher consolidation (2026-06, CLI-toolkit issue) already collapsed the
> old wrapper-per-command layout into the single manifest-driven `agent-ks`
> entrypoint, so this migration is now a near-1:1 rename of the `<group> <verb>`
> surface — much smaller than when these notes were first drafted.

## What stays unchanged

- The triage decision tree in SKILL.md (which reference file matches which task)
- The 5 reference files' *content* (writing rules, layout rules, settings schema)
- The 2 slash commands' purpose + UX (interactive scaffolding)
- The fundamental skill philosophy (eager triage on docs work, route to references)

## Plan at a glance

1. **Pre-migration:** plugin keeps working as-is. No changes until the binary lands.
2. **Phase A (binary ships v1):** add subcommands to the Go binary. Bash wrappers in plugin still work; both code paths exist for one release.
3. **Phase B (deprecation):** plugin's `agent-ks` shim prints a deprecation warning and forwards to `doc-engine <group> <verb>`. SKILL.md updated to recommend the new form.
4. **Phase C (removal):** delete `bin/` from plugin. Delete `.mjs` scripts. Plugin contains only SKILL.md, references, and slash commands.

The plugin gets *thinner* (less code to maintain), and Claude/users get the same UX with a single dependency (`doc-engine` binary instead of `bun + bash + plugin`).

## What this unlocks

- Plugin works in environments where Claude Code isn't running (CI, scripts, terminals). Today the wrappers technically work outside Claude Code but require Bun on PATH; after migration just the binary is needed.
- Validators can be wired into pre-commit hooks easily: `doc-engine check section default-docs/data/user-guide`.
- New tracker commands can be added without bash-script ceremony — just a new Cobra subcommand in Go.
- Schema validation can leverage compile-time types in Go (today the `.mjs` scripts duplicate schema knowledge).

## Companion notes

- **`02_subcommand-migration.md`** — the `agent-ks <group> <verb>` command surface mapped to `doc-engine` form.
- **`03_skill-and-references.md`** — SKILL.md updates and reference file edits required.
