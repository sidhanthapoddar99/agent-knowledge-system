---
title: "Documentation ↔ engine versioning structure + root-owned migrations"
---

# Goal

Give the documentation content and the documentation engine an explicit **version
contract**, so an engine upgrade can never silently run against content in an older
format: the engine refuses to start, names both versions, and tells the user to
have their AI run the migrations (which live at the repo root) and verify. This
formalizes what today is an ad-hoc, skill-owned mechanism into standard
versioned-schema practice.

## Context / background

Today the **skill owns migration entirely**: scripts live inside the plugin
(`plugins/documentation-guide/skills/documentation-guide/migration/<date>_<name>.py`),
the skill's `doc-migration.md` reference carries the detect → confirm → migrate
protocol, and nothing ties content format to engine version — a format drift
surfaces only as scattered validator warnings (or silent misbehavior). The
convention itself was established in
[2026-06-22-retire-done-field-and-migration-tooling](../2026-06-22-retire-done-field-and-migration-tooling/issue.md)
(dated one-off Python scripts, detect + dry-run + idempotent migrate) and works
well — what's wrong is the *ownership* (content-format migrations version with the
plugin, but the format belongs to the engine) and the *absence of a gate*.

Design deliberation: [brainstorm/01_idea_version-gate.md](brainstorm/01_idea_version-gate.md).
Pinned specification: [notes/01_versioning-and-migration-design.md](notes/01_versioning-and-migration-design.md).

## Done when…

- `site.yaml` declares the engine version the content targets; a missing
  declaration is treated as `0.0.0`.
- The engine carries its current version and a minimum-supported content version,
  and `loadSiteConfig()` hard-stops (both directions: too old → migrate, too new
  → upgrade the engine) with a message that names both versions and points at the
  AI-driven migration flow.
- Migration scripts live at the repo root `migration/`, named by the version they
  bring content **to** (`<version>_<statement>.py`), dates inside the docstring.
- Both skills document that migration code lives in the documentation-template
  root and reference the version gate; installed cache mirrored.
- User-guide documents the versioning structure; CLAUDE.md reflects the new
  layout + contract (last subtask).

## Scope decisions

- **In:** the version contract, the gate, the folder move + rename, skill + docs
  + CLAUDE.md updates.
- **Out:** auto-fix content migration (`--fix` rewriters — e.g. for legacy tags,
  see `2026-07-03-skill-custom-tags-staleness/subtasks/50`); plugin versioning
  itself (the plugin keeps its own 0.x.y, unrelated to this contract); the Go
  runtime's version story ([2026-05-08-runtime-stack-migration](../2026-05-08-runtime-stack-migration/issue.md)
  inherits this contract when it lands).
