---
title: "Fable review — skill coherence and idea-capture"
status: review
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

- [x] Run the Fable review agent with the brief above (read-only; findings
      report ranked by severity).
      *(Ran 2026-07-08. Verdict: "close to canonical — ready after three
      fixes." Full results recorded in
      [../agent-log/040_au_fable-skill-audit/01_summary.md](../agent-log/040_au_fable-skill-audit/01_summary.md).
      Headline: dataviz references still ~70–82% near-verbatim upstream text
      contradicting PROVENANCE.md; docs-layout.md teaches the broken
      `"adopts-site"` value; variable-list drift vs theme.yaml; stale/deictic
      sidecar example; history narrations; guide.ts misattribution.)*
- [x] Triage findings with sidhantha; apply accepted ones (repo + cache
      parity maintained). *(Accepted 2026-07-08: fix all, with genuine
      rewrite for the verbatim-prose finding per the settled
      rewrite-never-paste decision. Fix run:
      [../agent-log/050_wf_audit-fixes/](../agent-log/050_wf_audit-fixes/),
      Fable-model agents.)*
- [x] Record the outcome (agent-log milestone + tick here).
      *(Complete — [../agent-log/050_wf_audit-fixes/01_summary.md](../agent-log/050_wf_audit-fixes/01_summary.md):
      all 6 audit findings + 5 verifier residuals fixed; 8-shingle overlap
      down to ≤2.7% technical-constants-only; PROVENANCE.md claims now true;
      self-test green; cache parity zero-diff.)*

Related follow-up audit: [100_variation-capability-audit.md](100_variation-capability-audit.md)
— does the skill carry enough intent for the multi-variation interactive
design-option artifact pattern.
