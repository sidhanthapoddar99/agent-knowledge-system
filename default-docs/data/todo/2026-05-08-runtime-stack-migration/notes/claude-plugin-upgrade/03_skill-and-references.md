---
title: "Skill + reference updates — what to edit"
sidebar_label: "03 · Skill + references"
---

# Skill + reference updates — what to edit when migration ships

The skill (`SKILL.md`) and the 5 reference files describe how Claude reasons about documentation work. They need targeted edits — not rewrites — when the binary ships. This note enumerates them.

## SKILL.md

**File:** `plugins/documentation-guide/skills/agent-ks-docs/SKILL.md`

### Changes required

1. **Command examples** — every reference to a wrapper (`agent-ks issue list`, `agent-ks issue show`, etc.) renames to `doc-engine docs ...`. Mechanical sweep; preserve flags and semantics.

2. **Triage logic** — unchanged. The decision tree (which reference file matches which task) doesn't depend on tool names.

3. **Tool inventory section** — reword from "11 bash wrappers" to "subcommands of the `doc-engine` binary." Drop the bash/bun framing.

4. **"Don't use Grep on the tracker"** rule — keep verbatim. Reframe as "use `doc-engine docs list` (the schema-aware finder), not text grep."

5. **New section: "When the binary isn't installed"** — fallback guidance for users who haven't installed `doc-engine` yet. Probably points to install URL + a single `curl ... | sh` line.

### What does NOT change

- The five-reference triage model (one of `writing.md`, `docs-layout.md`, `blog-layout.md`, `issue-layout.md`, `settings-layout.md`)
- The "trigger eagerly for anything under default-docs/" rule
- The reference file selection criteria

## Reference files

All five live under `plugins/documentation-guide/skills/agent-ks-docs/references/`.

### `writing.md`

**Changes:** Likely none beyond stale command examples. Writing rules are content-only; not coupled to tooling.

### `docs-layout.md`

**Changes:** Update validation invocation examples (`agent-ks check section <folder>` → `doc-engine docs check section <folder>`). Layout rules themselves don't change.

### `blog-layout.md`

**Changes:** Same — `agent-ks check blog` → `doc-engine docs check blog`. Frontmatter / file naming rules unchanged.

### `issue-layout.md`

**Changes:**
- All wrapper invocations rename
- The "tracker mental model" framing (from `2026-05-07-tracker-mental-model-alignment`) stays
- The schema (priority, status, component, labels, vocabulary) is unchanged

### `settings-layout.md`

**Changes:** Update `agent-ks check config` references. Schema docs unchanged.

## CLAUDE.md (project root)

The project's `CLAUDE.md` lists all 11 wrappers in two tables (issue tracker + validators). Both tables get rewritten:

```markdown
Issue tracker:

| Command | Use |
|---|---|
| `doc-engine docs list` | Multi-field filter + free-text regex search ... |
| `doc-engine docs show` | One issue's metadata + subtask + log heads |
| ...

Validators (exit `0` clean / `1` on errors):

| Command | Use |
|---|---|
| `doc-engine docs check blog` | Validate `default-docs/data/blog/` |
| `doc-engine docs check config` | Validate `default-docs/config/` |
| `doc-engine docs check section <folder>` | Validate any docs section |
```

The "skills + tooling" overview prose at the top of CLAUDE.md updates to reflect "the binary on PATH" instead of "11 CLI wrappers."

## Slash commands

`/docs-init` and `/docs-add-section` stay. Their internal scripts may be rewritten to call `doc-engine` instead of running `.mjs` scripts directly, but the user-facing surface (the slash command + its prompts) is identical.

If `doc-engine init` and `doc-engine docs add-section` exist as proper subcommands, the slash commands could become thin wrappers:

```markdown
# .claude/commands/docs-init.md
Run `doc-engine init` interactively in the user's current directory. Pass through prompts.
```

## User-guide updates

Several pages in `default-docs/data/user-guide/` mention the wrappers or the bash/bun stack. Sweep needed:

| Page | Update |
|---|---|
| `05_getting-started/01_install.md` | Install command from `bun install` to `curl … \| sh` |
| `05_getting-started/02_run.md` | `./start dev` → `doc-engine dev` |
| `19_issues/...` | Wrapper command examples → subcommand form |
| `25_layouts/...` | Layout overlay path stays; references to `.astro` files renamed to `.html` (Go templates) |

The user-guide migration is a phase 5 task (see `brainstorm/04_discuss_stack-and-migration/03_migration.md`).

## Documentation parity

Throughout this migration, the documentation lives in two places:

1. **The plugin's references** (Claude-facing, terse, prescriptive)
2. **The user-guide** (human-facing, narrative, complete)

Both must be updated together. SKILL.md says "use `doc-engine docs list`"; user-guide explains *why*. Drift between the two confuses both Claude and humans.

## Validation pass

After all updates land, run:

```bash
doc-engine docs check section default-docs/data/user-guide
doc-engine docs check section default-docs/data/dev-docs
doc-engine docs check config default-docs/config
```

These are the same validators we have today, just under their new names. Clean exit means the docs themselves are consistent.

## Ordering

1. Land binary v1 (with subcommands working)
2. Add Phase B forwarders to existing wrappers (deprecation warnings)
3. Update SKILL.md + reference files (one PR)
4. Update CLAUDE.md (one PR)
5. Update user-guide (separate PRs per section)
6. Wait one release; collect feedback
7. Phase C: delete `bin/` and `scripts/` from the plugin

This sequence keeps the plugin functional throughout the migration and minimises the window where docs and tooling disagree.
