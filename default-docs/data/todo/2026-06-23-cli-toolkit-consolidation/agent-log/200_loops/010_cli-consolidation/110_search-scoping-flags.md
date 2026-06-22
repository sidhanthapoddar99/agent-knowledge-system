---
iteration: 10
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Subtask 09 — add the three search-scoping flags that fix the original failure mode. Approach (issues/list.mjs): --path <regex> (pure filter: keep issues whose id/folder slug OR any file path matches), --meta <regex> (JS scan of the structured layer only — .json whole-file + .md leading frontmatter block, via extractMetaRegions; distinct vertical cut from --search-fields), --count (per-issue match counts + a total summary line, no per-line excerpt dump). Threaded through json/default output via hasLineMatches; updated --help + the docs-list manifest flags. Result, all verified on the real tracker: 'docs-list --path astro' returns the astro-6-upgrade issue (THE original failure — broad 'astro' search flooded 38KB and missed it; --path nails it in one call); '--meta ai-skills' matches the component frontmatter (2 issues); '--search manifest --count' → 4 issues/68 matches with no flood. Harness 67/67. Next: subtask 10 (docs+blog list/show/search).
