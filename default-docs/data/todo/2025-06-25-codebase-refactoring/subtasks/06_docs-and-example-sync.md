---
title: "Sync docs + verify code examples match the refactored code"
status: open
---

**What it means.** After the refactor lands, the developer documentation (`data/dev-docs/`, especially the architecture + loaders pages) must describe the *new* module layout, and every code snippet in the docs must still match reality — file paths, function signatures, import lines.

**Deferred — gated on `2026-04-19-docs-phase-2`.** Per this issue's existing comment (2026-04-19), the doc-related items and the code-example freshness sweep are being seeded by phase-2 and shouldn't be tackled until phase-2's information architecture settles. Doing it now would mean redoing it against a moving structure. Related: [`../2026-04-19-docs-phase-2/issue.md`](../../2026-04-19-docs-phase-2/issue.md).

**Two parts:**
1. **Docs describe the new structure** — update architecture/loader dev-docs to reflect the split modules (subtask [01_split-large-loaders]) and the standardized error-handling contract (subtask [02_standardize-error-handling]).
2. **Examples verified** — grep dev-docs for code blocks referencing `src/loaders/…` paths/APIs and confirm each still resolves after the refactor.

**Done when.** Phase-2 IA is settled, the loader dev-docs match the post-refactor module layout, and no doc code example references a moved/renamed/removed symbol.
