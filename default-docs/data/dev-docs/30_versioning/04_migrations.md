---
title: Migrations
description: The migration/ system — naming, the chain rule, and the upgrade flow
sidebar_position: 4
---

# Migrations

Migration scripts bring a content tree from an older format to the current
engine's format. They live at the **repo root**:

```
<repo-root>/migration/
├── README.md                    # the convention, one screen
├── 0.1.0_done-to-state.py
├── 0.1.1_state-to-status.py
├── 0.1.2_legacy-custom-tags.py
└── 0.1.2_root-settings-schema.py
```

## Why the repo root

Migrations ship **with the engine** — same clone, same pull. A consumer who
updates the framework automatically has exactly the migrations that engine
needs; there is no separate tool or plugin whose version could skew against the
engine's. (They lived inside the Claude Code plugin historically; the plugin
now carries only the operating manual, `references/doc-migration.md`.)

## Naming — version-based, not date-based

`<to-version>_<statement>.py` — the **engine version the script brings content
to**, then a short statement:

```
0.1.1_state-to-status.py     ← migrates content TO the 0.1.1 format
```

Version order **is** execution order — that's what the gate's instruction
chains on. Authoring dates live inside each script's docstring: provenance, not
ordering.

## Types of migrations — anything that changes what authors write

A migration is not just a frontmatter rename. **Any change to what valid
content looks like ships as a migration script** — and the non-obvious classes
are the ones that get skipped:

| Type | What changed | Shipped example |
|---|---|---|
| **Frontmatter / field** | A field renamed, retyped, or removed | `0.1.0_done-to-state.py`, `0.1.1_state-to-status.py` |
| **Settings schema** | Structure of a `settings.json(c)` | `0.1.2_root-settings-schema.py` |
| **Content syntax** | The *authoring syntax itself* — markup constructs retired or replaced in page bodies | `0.1.2_legacy-custom-tags.py` (`:::callout` / `<callout>` / `<tabs>` / `<collapsible>` → GFM alerts, `<details>`, `###` sections) |

Content-syntax migrations are the easiest to forget — the old markup often
doesn't *error*, it just renders wrong or as raw text, silently. If a release
retires or replaces a syntax that existing pages may contain, that release owes
a syntax migration script, same contract as any other (detect + `--dry-run` +
idempotent migrate) plus one extra rule: be **mention-aware** — fenced code
examples, inline code spans, and frontmatter that merely *talk about* the old
syntax are mentions, not usage, and must be skipped.

## The chain rule

When the gate reports *content targets X, engine is Y*, the upgrade runs
**every script with a version in `(X, Y]`, ascending** — going 0.0.5 → 0.1.2 means
running everything above 0.0.5 up to and including 0.1.2, not just the newest
script. This is also how good-to-have migrations (which never moved the floor —
see [Minimum Version](./minimum-version)) eventually reach older trees: the
next breaking chain sweeps them up.

For each script in the chain:

1. **Detect** — read-only scan; reports whether and where (file + line) legacy
   format exists. A detect with zero hits is a **passed check, not a skipped
   script**.
2. **`--dry-run`** — what would change, without writing.
3. **Migrate** — idempotent; re-running finds zero instances.
4. **Re-detect** — must report zero. This re-run is the migration test.

Then the tree-wide verification (`agent-ks check issues`,
`agent-ks check section …`, a build) and **only then** the bump:
`engine_version: "Y"` in `site.yaml`.

> [!CAUTION]
> Never bump `engine_version` to silence the gate — regardless of who asks.
> The gate's entire purpose is *detecting* that migration is needed; a bare
> bump doesn't make content compatible, it relocates the breakage somewhere
> the engine can no longer point at it. The bump is the last step of a
> completed, verified chain — never the first.

## Division of labour

| Owner | Carries |
|---|---|
| Repo root `migration/` | The scripts + `README.md` convention |
| Engine (`engine-version.ts`) | The gate + both version anchors |
| Skill (`doc-migration.md`) | The operating protocol for AI assistants (detect → confirm → migrate, the never-bump rule) |
| Docs (this section + user-guide) | The contract, for humans |
