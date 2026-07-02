---
title: "Consolidate repeated primitives into shared utilities"
state: open
---

**What it means.** The loaders re-implement the same low-level operations in several places. Pull the recurring ones into a single shared helper each, so there's one implementation to reason about and fix.

**Candidates observed:**
- **mtime stat** — `statMtime()` / `fs.statSync(...).mtimeMs` swallowing errors is duplicated (e.g. `issues.ts`, `data.ts`, and now `settings-file.ts`'s `statSettingsMtime`).
- **safe JSON/JSONC read** — `readJson` in `issues.ts` now delegates to `settings-file.ts`; audit for other hand-rolled JSON reads and route them through it.
- **cache-signature building** — the recursive folder-walk that sums mtimes could share a primitive.

**Already done (don't redo).** `settings-file.ts` (JSONC + settings resolution) and `cache-manager.ts` (unified mtime cache) are the good examples of this pattern — extend them rather than adding parallel helpers.

**Why it matters.** Duplicated primitives drift — a fix to one copy (e.g. handling a new edge case in mtime reads) silently misses the others.

**Done when.** The duplicated helpers above have a single home and call sites import from it; no behavior change. Overlaps with [01_split-large-loaders] and [02_standardize-error-handling] — coordinate so the extraction isn't done twice.
