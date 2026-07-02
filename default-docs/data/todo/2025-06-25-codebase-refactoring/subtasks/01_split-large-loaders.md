---
title: "Split oversized loader files into focused modules"
state: open
---

**What it means.** Several files in `astro-doc-code/src/loaders/` are well over the project's ~400-line module guideline (CLAUDE.md rule 7: split large files into `parts/` / smaller modules). Break each along its natural seams into smaller, single-responsibility modules — same public API, just decomposed internals.

**Current state (line counts):**

| File | Lines | Seam to split on |
|---|---|---|
| `issues.ts` | 777 | loading/scanning · signature/caching · rendering · vocabulary — each is a distinct concern already |
| `cache-manager.ts` | 524 | file-type detection · dependency graph · invalidation |
| `theme.ts` | 513 | resolution · inheritance/merging · CSS assembly |
| `data.ts` | 438 | content loading · settings loading (already partly extracted to `settings-file.ts`) |

**Why it matters.** These are the hardest files to reason about and the most-touched. Smaller modules make the seams testable in isolation and mirror the `parts/` pattern the layouts already use.

**Done when.** No loader file exceeds ~400 lines (or an over-limit file carries a one-line comment justifying why it's cohesive and shouldn't split); public exports from `loaders/index.ts` are unchanged; `./start build` stays clean.
