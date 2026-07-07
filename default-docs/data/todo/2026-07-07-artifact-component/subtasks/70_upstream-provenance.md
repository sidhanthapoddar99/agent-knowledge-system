---
title: "Upstream provenance — keep the source map true and document the fold-in protocol"
status: open
---

## Goal

The converged authoring skill from [`40_authoring-skill.md`](./40_authoring-skill.md)
is built by rewriting four Anthropic-authored skills that have **upstream lives**
(Claude Code built-ins shipped with v2.1.202, and the official plugin
marketplace). To keep the skill maintainable — so a future upstream revision can
be diffed against what we captured and folded back in — we keep a **provenance
map** and a **repeatable re-capture protocol**. This subtask owns that record and
protocol; it is the durable counterpart to the one-time convergence work in `40`.

The provenance note already exists at
[`../notes/01_skill-sources-and-provenance.md`](../notes/01_skill-sources-and-provenance.md).
This subtask keeps it **true through implementation** (it was written from the
convergence *plan*; once `40` actually writes content in, the "what flowed where"
map must reflect what shipped) and adds the operational decisions the note
defers: where the source snapshots permanently live, and the exact fold-in
procedure.

## Context — what we captured (from the note + agent-memory)

- Sources live at repo-root `tmp_skills/`: `artifact-design/`, `dataviz/`,
  `design-sync/`, `frontend-design/`. That directory is currently **untracked** —
  its `.gitignore` is `**` (verified) — so the snapshots are not in git today.
- Captured 2026-07-07: the three built-ins (`artifact-design`, `dataviz`,
  `design-sync`) via the Skill-tool load + extraction from the bundled-skills
  cache; `frontend-design` from the official plugin marketplace cache (verbatim,
  with frontmatter). Origin versions: Claude Code v2.1.202 built-ins; official
  Anthropic plugin marketplace.

## Tasks

- [ ] **Reconcile the provenance map with what shipped.** After `40` writes the
      skill, update `../notes/01_skill-sources-and-provenance.md` so its
      "what content flowed where" table reflects the **actual** SKILL.md sections
      and reference files produced (not the pre-implementation plan). For each of
      the four sources record: origin (product + version), capture method, capture
      date, and the destination section(s) in the converged skill. Note the
      dropped-but-exists-upstream items (e.g. `validate_palette.py`, the entire
      design-sync build pipeline) so a future maintainer knows they were a
      conscious omission, not an oversight. Done when the map's destinations match
      the shipped skill file-for-file.

- [ ] **Decide the permanent home for `tmp_skills/`.** It is untracked scratch
      today. Deliberate and record the choice (this is a real fork — capture the
      trade-off, don't just pick): (a) **keep untracked** — smallest repo, but the
      diff baseline for future upstream comparison is lost the moment the machine
      is wiped; (b) **commit a pristine snapshot** somewhere durable (e.g. under
      the skill as `references/_upstream-snapshot/` or a repo location the
      provenance note names) so future re-captures can be diffed against exactly
      what we started from — the cost is committing Anthropic-authored source into
      a public repo, which the "never paste verbatim" concern was about; (c) a
      middle path — commit only a **content hash + section index** of each source
      (enough to detect upstream drift) without the full text. Recommend one,
      execute it, and make the provenance note point at the chosen location. Done
      when `tmp_skills/`'s fate is settled and the note reflects it.

- [ ] **Write the re-capture → diff → fold-in protocol.** A repeatable procedure
      (in the provenance note or a `references/` file the note links) for when an
      upstream source updates: (1) **re-capture** the current upstream skill the
      same way it was first captured (record the new version); (2) **diff** it
      against our stored baseline (or hash/section index) to surface new or
      changed guidance; (3) **triage** each change against the convergence
      map — does it belong in our skill, is it claude.ai-specific and therefore
      dropped, or does it conflict with our publish-target rewrite; (4) **fold in**
      accepted changes by rewriting into the existing section (never paste), and
      (5) **update the provenance map + baseline** to the new version. Done when a
      maintainer could execute a fold-in a year from now from this text alone.

- [ ] **Record the "rewritten, not pasted" guarantee.** State in the note that
      shipped skill content is our adaptation, that the sources are
      Anthropic-authored, and how the fold-in protocol preserves that boundary
      (fold-in edits are rewrites of our sections, informed by the upstream diff —
      not verbatim copies). This is the public-repo license posture; keep it
      explicit. Done when the note carries the provenance + authorship statement.

- [ ] **Verification.** Cross-check the finished provenance map against the
      shipped skill: every SKILL.md section and reference file names its
      source(s), and every source's contributions are accounted for (nothing
      claimed that isn't there, nothing shipped without provenance). Confirm the
      chosen `tmp_skills/` home actually exists as described (path present, or the
      hash/index committed) and that the note's links resolve. Dry-run the fold-in
      protocol's first two steps (re-capture + diff) against one source to prove
      the procedure is executable, not aspirational.
