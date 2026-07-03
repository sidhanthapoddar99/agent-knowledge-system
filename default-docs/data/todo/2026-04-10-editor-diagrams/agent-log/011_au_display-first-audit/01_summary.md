---
title: "Summary — display-first audit: shipped work validates clean; triage list produced"
agent: claude
date: 2026-07-04
---

## Summary

Six report-only subagents (3 Haiku on docs, 2 Opus on skills+code, 1 Opus
on tooling research) audited the display-first diagram work. **No fixes were
applied** — everything below is triage input.

**Validates clean:** all diagram-related user-guide pages (links, assets,
frontmatter, 10 cross-page feature claims consistent); no stale claims or
dead links anywhere in dev-docs; skills repo↔cache byte-identical and every
diagram claim in both skills matches the shipped code; the pipeline's core
security surfaces (path traversal, attribute escaping, ETag/304, collision
drops, postprocessor ordering) verified correct.

**Triage list (by weight):**

1. **Code, medium ×3** — `content-assets` serves *every* non-markdown file
   under all content roots (allowlist wanted); excalidraw captions
   double-escape alt text (`A & B` → `A &amp; B`); mermaid
   `securityLevel: 'loose'` is a policy call if untrusted content ever
   renders. Lows in `102_skills-code-audit.md`.
2. **Dev-docs gaps ×6** — the new internals (diagram pages, excalidraw
   embed, asset-src, cache strategy, table-wrap, issue-body-links) are
   undocumented; suggested homes in `101_docs-audit.md`. Pairs with the
   audience-split rule newly codified in CLAUDE.md.
3. **Audience split** — sections are 93%+ consistent; 6 user-guide pages
   lean internals (worst: `10_configuration/03_site/09_reference.md`,
   TypeScript interfaces shown to YAML users).
4. **Cosmetic** — one phrasing note in doc-issues `10_writing.md:107`.

**Research (M3):** tooling direction decided and written to
`notes/03_diagram-tooling-research.md` — build `docs-guide excalidraw
summary/edit` (MCPs are canvas-bound, not file-based; format is trivially
editable JSON), adopt headless exporters + `mmdc`.
`subtasks/40_tooling/20_diagram-tooling-research.md` → review.

**Fix pass (2026-07-04, review feedback):** triage item 2 closed — the six
dev-docs gaps are written (post-processing sections for all four missing
postprocessors + an "adding a new embed type" recipe; data-loading diagram
pages section; diagrams-script excalidraw coverage), the skill now shows
the meta.json structure, all history narration is purged from the skills,
and CLAUDE.md gained the audience-split + lean-skills rules. Build green.
Still open: code findings (item 1) and user-guide audience moves (item 3).

## Milestones

- `101_docs-audit.md` — Haiku fleet: user-guide clean, dev-docs gap list,
  audience-split flags.
- `102_skills-code-audit.md` — skills clean; code findings ranked.
- `103_tooling-research.md` — build-vs-adopt verdict, graduated to notes.
- `104_gap-fixes.md` — dev-docs internals written, skills de-historied,
  CLAUDE.md rules added.
