---
title: "Version gate — content declares its engine version, the engine enforces a floor"
---

# Version gate — content declares its engine version, the engine enforces a floor

Proposed by sidhantha, 2026-07-03, immediately after the native-markdown migration
shipped (`../../2026-07-03-skill-custom-tags-staleness/`) — that work surfaced how
format changes propagate today, and what's missing.

## How migration works today — the skill owns it

- **Scripts** live *inside the plugin*:
  `plugins/documentation-guide/skills/documentation-guide/migration/<YYYY-MM-DD>_<name>.py`
  — three exist (`2026-06-22_done-to-state`, `2026-07-02_state-to-status`,
  `2026-07-03_root-settings-schema`), each self-documenting, stdlib-only,
  detect + `--dry-run` + idempotent migrate.
- **The protocol** lives in the skill (`references/doc-migration.md`): reach for
  migrations only when the user asks, a validator flags a legacy field, or a
  "does X need migrating?" question comes up; always detect → show count →
  confirm → migrate.
- **No version linkage anywhere.** Content doesn't say what format it's in; the
  engine doesn't say what format it expects. Drift is discovered by validator
  warnings, build errors, or silently wrong rendering. And the ownership is
  inverted: migrations ride *plugin* releases while the format they migrate
  belongs to the *engine*.

## The idea (sidhantha, dictated)

Match the version of the documentation against the version of the documentation
engine, with an explicit compatibility floor:

- The documentation declares which engine version it targets — **in `site.yaml`**.
- The engine carries **its own current version** and a **backward-compatibility
  minimum** somewhere inside the engine itself.
- If the documentation works on version 0.5 and the engine is 0.7 (with a floor
  above 0.5), the engine **explicitly stops working** and says: *you need to
  migrate from 0.5 to 0.7 — ask your AI to perform the migration and the
  migration tests, and check for upgrade options.*
- **Version format `N.N.N`**, first `N` = 0 while the project is in beta. A
  content tree with **no version declaration is `0.0.0`** — so every
  pre-versioning project trips the gate exactly once and gets migrated onto the
  contract.
- **Migration scripts move from the plugin to the repo root** under `migration/`
  — they are part of the documentation-template itself, present in every clone,
  not an artifact of one AI plugin. The skill keeps the *operating manual* but
  points at the root: "the migration code is in the documentation-template —
  refer to that."
- **Script naming flips from date-based to version-based**: version number, then
  a statement (`0.6.0_state-to-status.py`). Dates move inside the docstring —
  they're provenance, not ordering. Ordering by version is what the gate chains
  on: apply every script between the content's version and the engine's.

## Why this shape

- **The stop is the feature.** In an AI-augmented workflow the expensive failure
  is *silent* drift; a hard, explanatory error is cheap — the user pastes it to
  their AI, the AI finds `migration/`, runs the chain, bumps `site.yaml`, done.
  The error message is effectively a prompt.
- **Root ownership matches the release unit.** Engine and migrations ship in the
  same clone/pull; a consumer who updates the framework folder automatically has
  exactly the migrations that engine needs — no plugin-version skew.
- **Standard practice** — schema-versioned content + minimum-supported floor is
  how databases (Alembic), Obsidian vaults, and app config formats all handle
  this. Nothing exotic to explain.

## Settled in-discussion

- `site.yaml` key: `engine_version` (reads as "the engine version this content
  targets"). Top-level, sibling of `theme`.
- Engine anchors at **0.7.0** — the project already calls its current lifecycle
  v0.7 in commits and issue titles; `package.json`'s `1.0.0` is a placeholder to
  ignore.
- Floor starts **equal to current (0.7.0)**: pre-contract content (0.0.0) must
  migrate once; from then on the floor moves only when a format actually breaks.
- Too-new content (engine older than content declares) is also a hard stop —
  "upgrade the engine" — same gate, other direction.
