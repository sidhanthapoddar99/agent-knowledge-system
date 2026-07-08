---
title: "M1 — subtasks 20/30/40: identity sweep, open-issue consistency, legacy note"
iteration: 1
---

## Goal

Execute the next three subtasks combined (sidhantha's ask), after his reorder
of the queue (plugin rename now precedes the new repo; archive moved last since
an archived repo is read-only).

## Approach

Classified all 96 live-surface `documentation-template` hits into *identity*
mentions (renamed to agent-knowledge-system) vs *literals* — folder names
(`documentation-template/` clone dir), GitHub URLs, and `_env.mjs` discovery
paths — which stay until subtasks 60/70/90. Then a status-gated pass over the
26 non-closed issues: only forward-looking files (open subtasks, mutable
agent-memory, plan notes) got the new vocabulary; done records kept theirs.

## Result

- **20**: CLAUDE.md + root README repositioned (knowledge + task system for AI
  consumers; README carries a "rebrand in progress" banner since URLs still
  point at the old repo); user-guide overview, dev-docs architecture overview,
  `about.yaml`, `package.json`, plugin README/plugin.json descriptions, and
  the `agent-ks help` header now say agent-knowledge-system. → review
- **30**: forward-looking fixes in 8 issues — artifact-component (110/120
  subtasks, issue body, agent-memory), docs-phase-2 (08), knowledge-graph
  (06), editor-diagrams (excalidraw tooling subtask + research note, now
  `agent-ks excalidraw …`), future-feature-ideas, runtime-stack-migration
  (plugin-upgrade notes' skill paths). → review
- **40**: legacy note (3 lines + deletion condition) sits under CLAUDE.md's
  Project Overview. → review
- Cache re-mirrored (parity clean); `agent-ks check issues` unchanged; build
  clean (826 pages).

## Next

Fleet validation results (running); then human review of 10/20/30/40. Next
executable slice: 50 (plugin rename) — needs the marketplace coordination
decision.
