---
iteration: 2
agent: claude
status: success
date: 2026-06-09
---

Goal: subtask 04 — colocated assets/images for issues content (decided 2026-06-09: the full pipeline unification from 2026-04-19-knowledge-graph-and-wiki-links is deferred to the Go migration; this is the narrow Astro bugfix).
Approach: (1) wired createAssetEmbedPreprocessor into IssuesParser using its previously-dead getAssetPath() resolver; (2) new issues-only postprocessor parsers/postprocessors/issue-asset-src.ts rewriting relative <img src> to absolute /issue-assets/<tracker-rel> (render-time absolute = depth-proof, same principle as subtask 03); (3) new endpoint pages/issue-assets/[...path].ts serving non-md/non-settings.json files from all configured issues data dirs (mime + ETag/304 + getStaticPaths, mirrors /assets route); shared mime map extracted to pages/lib/mime.ts.
Result: build clean (479 pages); dev GET 200 image/svg+xml, 404 for settings.json/.md/traversal; dogfood image in subtasks/04 renders on the sub-doc page and in the Comprehensive panel; `[[../assets/…]]` embed inlines content. Gotcha found: Astro silently excludes _-prefixed dirs under src/pages from routing — initial /_issue-assets route never registered; renamed to /issue-assets. Escaped a literal `[[Skills]]` heading in 2025-06-25-claude-skills notes that the now-active embed pass flagged. Updated user-guide (19_issues/05_sub-docs/01_issue-md.md assets section, 15_writing-content/03_asset-embedding.md issues section) + dev-docs parser overview file list. Migration issue got notes/architecture-update/02_known-issues-content-pipeline.md recording the per-parser divergence as a Go-pipeline design requirement.
Security hardening (post-review): containment checks in both file-serving routes upgraded from prefix startsWith to segment-boundary path.relative — the new /issue-assets route also realpaths file+dir first (symlink-proof); the pre-existing /assets route got the boundary fix only, preserving legit symlinked-asset-dir behavior.
Next: subtask 03 (render-time absolute internal links) remains open; human verify -> close subtask 04.
