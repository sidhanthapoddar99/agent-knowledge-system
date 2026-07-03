---
title: "Task list — display-first audit fleet"
agent: claude
date: 2026-07-04
---

Six report-only subagents, launched in parallel. Small/cheap checks on Haiku,
judgement-heavy checks and research on Opus.

- [x] **H1 (Haiku)** — user-guide diagram docs: frontmatter, prefixes, link
      integrity, internal consistency across the diagram-related pages.
      **Clean** — all 6 pages pass; 10 cross-page diagram claims consistent.
- [x] **H2 (Haiku)** — dev-docs staleness sweep: stale claims about custom
      tags, the asset pipeline, and the diagram feature.
      **No stale claims, no dead links** — but 6 documentation gaps: diagram
      pages, excalidraw embeds, asset-src details, cache headers, and the
      table-wrap / issue-body-links postprocessors are all undocumented in
      dev-docs (details in `101_docs-audit.md`).
- [x] **H3 (Haiku)** — audience-split audit: classify user-guide and dev-docs
      pages against the usage-vs-internals distinction; flag misfiled content.
      **Broadly consistent** (user-guide 93% pure usage); 6 user-guide pages
      flagged as internals-leaning, dev-docs essentially fine (details in
      `101_docs-audit.md`).
- [x] **O1 (Opus)** — skills validation: diagram claims in both skills vs
      shipped code; repo↔cache parity diff.
      **Clean** — repo↔cache byte-identical; every diagram claim in both
      skills matches the shipped code. One soft phrasing note in the
      doc-issues writing reference (details in `102_skills-code-audit.md`).
- [x] **O2 (Opus)** — code review of the diagram pipeline (report-only).
      **3 medium findings** (content-assets over-serving, double-escaped
      alt captions, mermaid `securityLevel: 'loose'`) + several lows; core
      security surfaces (traversal, escaping, caching) verified clean
      (details in `102_skills-code-audit.md`).
- [x] **O3 (Opus)** — research: excalidraw MCP / scene-editing tooling,
      mermaid preview tooling (feeds `subtasks/40_tooling/`).
      **Done** — verdict: build `docs-guide excalidraw summary/edit`, adopt
      headless exporters + `mmdc`; MCPs are canvas-bound, not file-based.
      Report: `notes/03_diagram-tooling-research.md`, milestone
      `103_tooling-research.md`.
- [x] Compile findings into milestone files + summary; hand back for triage.
      Milestones `101`–`103` + `01_summary.md` written 2026-07-04.
