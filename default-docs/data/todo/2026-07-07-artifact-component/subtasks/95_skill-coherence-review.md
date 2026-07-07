---
title: "Fable review — skill coherence and idea-capture"
status: in-progress
---

Requested by sidhantha (2026-07-07): after all implementation lands, a
dedicated review of the skills layer by a **Fable** subagent (the top model
tier) — independent of every agent that wrote or fixed the skills, so the
judgment is untainted by the implementers' framing. The reviewer reports
findings; it does not edit. What to apply gets decided with the user.

## Review brief

- **Coherence** — `artifact-authoring` must read as ONE skill, not four
  rewrites stapled together: consistent voice and terminology, no
  contradictory guidance across the merged sources (artifact-design ↔
  frontend-design ↔ dataviz ↔ design-sync extractions), clean lean-triage
  shape (SKILL.md routes; references/ carry depth).
- **Idea capture** — the whole session's arc must be present and correctly
  weighted: two publish surfaces (docs sections + tracker `notes/`/
  `brainstorm/`), the `.meta.json` sidecar contract with AI-legible declared
  values, the mode-choice doctrine (`site` for data representation; **always
  `self`** for UI/UX deliberation, even when themes coincide), the inline
  variable contract + standalone-distribution rationale, the neutral
  fallback-layer rule, design-system creation flows (issue brainstorm vs
  published docs section), palette validation via the bundled script and
  `docs-guide theme tokens`.
- **Cold-agent test** — could an agent following only the skill produce a
  correct artifact without guessing (the design-sync "act on this without
  guessing" bar)? Are the reserved-URL limitation and the two-mode choice
  stated where an author actually trips on them?
- **Ecosystem wiring** — `documentation-guide` and `doc-issues` hand off to
  `artifact-authoring` at the right trigger moments; `guide.ts` legend in
  sync; everything history-free (no "newly added" phrasing).
- **Hygiene** — repo ↔ installed-cache byte parity; no near-verbatim upstream
  prose (spot-check distinctive sentences against `tmp_skills/`); frontmatter
  and trigger descriptions well-formed.

## Tasks

- [ ] Run the Fable review agent with the brief above (read-only; findings
      report ranked by severity).
- [ ] Triage findings with sidhantha; apply accepted ones (repo + cache
      parity maintained).
- [ ] Record the outcome (agent-log milestone + tick here).
