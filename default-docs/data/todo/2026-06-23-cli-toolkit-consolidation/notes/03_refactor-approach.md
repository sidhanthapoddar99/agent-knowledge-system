---
title: "Proposed refactor approach & open decisions"
---

# Proposed refactor approach & open decisions

> Superseded/expanded by [`04_cli-landscape-and-category-0.md`](04_cli-landscape-and-category-0.md), which adds the full landscape map, Category 0 (shared contract + discovery), the manifest approach, the `git` command, and Windows/Python notes. This file holds the original priority framing.

## What the matrix tells us to do (priority order)

1. **Fill Category 2 for docs/blog** — add `list` / `show` / `search` for docs and blog. This is the highest-value work: it's the direct fix for the search failure that prompted this issue.
2. **Wire the orphaned issues `check`** — `scripts/issues/check.mjs` exists; add it to the `COMMANDS` map + a shim pair (`docs-check-issues`). Cheap, closes the validator gap.
3. **Add the search-scoping flags** — `--path`, `--meta`, `--count` (see `01_feature-matrix.md`).
4. **Add Category 1 `find`** — the unified cross-content path + raw-text search (the "docs-find" idea). Optional `link-check` later.
5. **Factor a shared list/search core lib** so the three per-type `list`/`search` impls share filtering, output formatting (`--json` / `--paths-only` / `--count`), and regex handling instead of diverging.

## The open decision — naming model

Two viable shapes; this is the main thing to settle before building:

**A. Keep flat `docs-*` names.** `docs-list`, `docs-show`, plus new `docs-blog-list`, `docs-docs-list`… — but this gets awkward once three types each need list/show/search (the `docs-docs-*` stutter).

**B. Move to `docs <group> <verb>` subcommands.** `docs issue list`, `docs blog list`, `docs docs list`, with cross-content verbs staying top-level (`docs move`, `docs img`, `docs find`). Groups naturally, scales as Category 2 fills out, and collapses to **one** binary on PATH (smaller collision surface — the `docs-` prefix exists today purely to avoid clashing with other plugins' bins). The dispatcher already takes the command as `argv[2]`, so this is cheap. Keep thin `docs-list`-style aliases for muscle memory.

**Lean:** B, once Category 2 is filled — three `list`s and three `show`s *want* a namespace. But A is fine if the set stays small. **Decision pending.**

## Cross-content `find` vs issues-only `search`

- `search` (Category 2) is **schema-aware** per type — issue filters (`status`/`priority`/`component`), blog frontmatter (tags/date), docs section/frontmatter. Different engine per type.
- `find` (Category 1) is **schema-agnostic** — path + raw-text + `--meta` across *all* content at once. One engine.

Both should exist; they answer different questions ("find the issue about X" vs "where is this string anywhere in content").

## Open questions for discussion

- Naming model A vs B (above).
- How much to build now vs defer — minimum useful slice is likely **(2) wire issues check + (3) search flags + the docs/blog `list`/`search`** from (1).
- Is `Config` a first-class tooling target or just a validator? (Affects whether `settings` becomes a real verb.)
- Should `find` and `link-check` ship as Category 1 from the start, or after Category 2 lands?
