---
title: "Docs + skills — every surface teaches native markdown"
iteration: 2
agent: claude-opus-4-8
status: success
date: 2026-07-03
---

# Docs + skills — every surface teaches native markdown

## Goal

Subtasks 30 + 40 (two parallel agents, disjoint file sets): purge custom-tags
mentions from the published docs and both plugin skills, and write the positive
native-markdown reference in their place.

## Result

**User-guide / dev-docs (subtask 30)** — 17 files changed:

- `15_writing-content/02_markdown-basics.md` gained Callouts (all five alert
  types + purpose table), Collapsible (`<details>`), and Diagrams sections;
  `01_overview.md` lost the custom-tags status note and its fictional pipeline
  stage; `03_asset-embedding.md` now states the one-extension-pattern principle
  (future embeds extend `[[path]]` by extension, never new tag syntax).
- dev-docs described a transformer pipeline stage that never existed:
  `04_parser/07_transformers.md` **deleted** whole; six architecture pages +
  the request-flow mermaid re-drawn to the real preprocess → render →
  postprocess pipeline; alias tables and processing rows cleaned.
- Orchestrator follow-up: added the verified `.markdown-alert` classes row to
  `25_themes/05_component-styles/02_markdown-styles.md` (the docs agent
  correctly declined to assert classes while the renderer task was in flight).

**Skills (subtask 40)** — both writing references replaced their "Custom tags"
sections with native-toolkit guidance (GFM alerts, `<details>`, fenced diagrams,
`[[path]]`); seven further stale mentions rewritten across `writing.md`,
`SKILL.md`, `10_writing/10_writing.md`; every edit mirrored to the installed
cache `0.5.1` with a clean `diff -rq` parity check.

## Next

Integration verification (milestone #3).
