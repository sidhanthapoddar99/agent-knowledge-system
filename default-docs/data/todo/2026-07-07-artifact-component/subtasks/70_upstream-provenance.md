---
title: "Upstream provenance — keep the source map true and document the fold-in protocol"
status: review
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

- [x] **Reconcile the provenance map with what shipped.** After `40` writes the
      skill, update `../notes/01_skill-sources-and-provenance.md` so its
      "what content flowed where" table reflects the **actual** SKILL.md sections
      and reference files produced (not the pre-implementation plan). For each of
      the four sources record: origin (product + version), capture method, capture
      date, and the destination section(s) in the converged skill. Note the
      dropped-but-exists-upstream items (e.g. `validate_palette.py`, the entire
      design-sync build pipeline) so a future maintainer knows they were a
      conscious omission, not an oversight. Done when the map's destinations match
      the shipped skill file-for-file.

- [x] **Decide the permanent home for `tmp_skills/`.** It is untracked scratch
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

- [x] **Write the re-capture → diff → fold-in protocol.** A repeatable procedure
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

- [x] **Record the "rewritten, not pasted" guarantee.** State in the note that
      shipped skill content is our adaptation, that the sources are
      Anthropic-authored, and how the fold-in protocol preserves that boundary
      (fold-in edits are rewrites of our sections, informed by the upstream diff —
      not verbatim copies). This is the public-repo license posture; keep it
      explicit. Done when the note carries the provenance + authorship statement.

- [x] **Verification.** Cross-check the finished provenance map against the
      shipped skill: every SKILL.md section and reference file names its
      source(s), and every source's contributions are accounted for (nothing
      claimed that isn't there, nothing shipped without provenance). Confirm the
      chosen `tmp_skills/` home actually exists as described (path present, or the
      hash/index committed) and that the note's links resolve. Dry-run the fold-in
      protocol's first two steps (re-capture + diff) against one source to prove
      the procedure is executable, not aspirational.

## Status note (2026-07-07)

The committable deliverable — the **integrity manifest** — is shipped and verified
at [`../notes/04_upstream-integrity-manifest.json`](../notes/04_upstream-integrity-manifest.json):
per-file `sha256` for all 39 files under `tmp_skills/`, byte-exact-vs-transcribed
flags, capture date, upstream coordinates, and convergence destinations. Every
hash re-verified against disk; the JSON parses and covers the tree with no
missing/extra entries. The permanent-home decision (c), the fold-in protocol, and
the "rewritten, not pasted" guarantee are recorded (note/01 + the manifest) — those
three checkboxes are ticked.

**Dry-run of the fold-in protocol (steps 1–2) — done and it caught a real drift.**
Re-captured `frontend-design` from `anthropics/skills` HEAD and diffed against our
stored copy: the public mirror (`sha256 1608ea77…`, 8260 B) is a substantially
rewritten revision, **not** byte-identical to our capture (`d39adf3a…`, 4274 B),
and its last change (2026-06-09) predates our capture — so the plugin-cache release
we captured already lagged the mirror. Pinned SHA + caveat recorded in note/01 §3
and the manifest. This proves the procedure is executable and surfaces a genuine
delta a future maintainer must fold in.

**Reconciliation + verification — done (2026-07-07, after `40` shipped).** The
`artifact-authoring` skill is now built and mirrored to the installed cache, so the
two previously-blocked checkboxes are complete:

- **Provenance map reconciled file-for-file with the shipped skill.** note/01 now
  carries a "Reconciliation — the shipped map" table mapping every shipped file
  (`SKILL.md` §0–§3, `design-fundamentals.md`, `publishing.md`, `design-systems.md`,
  the `dataviz/` set, `palette.md`, `validate_palette.js`, `PROVENANCE.md`) to its
  source(s) and its verbatim-ness. The manifest's `convergence_target.status` is
  updated PLANNED → RECONCILED and flags where the pre-implementation
  `convergence_destination` strings were superseded (dataviz shipped as a *directory*,
  not `dataviz.md`; design-sync doctrine as `design-systems.md`; the artifact-design
  spine split across `SKILL.md` + `design-fundamentals.md`).
- **Verbatim-ness verified, not assumed.** The seven `references/dataviz/*.md` files
  were diffed against their frozen `tmp_skills/dataviz/references/` baseline and
  measured at **1–10% six-gram overlap** — genuine re-expression. `validate_palette.js`
  remains the single deliberate verbatim carve-out. The "rewritten, not pasted"
  guarantee (already ticked) holds file-for-file *as shipped*; the `PROVENANCE.md`
  claim is accurate.
- **Verification cross-check passed:** every shipped section names its source; all
  four sources are accounted for (nothing claimed absent, nothing shipped without
  provenance); the `tmp_skills/` home is as described (untracked here, manifest
  committed, private baseline a USER item); and the fold-in re-capture→diff dry-run
  now has **two** executed instances (frontend-design public re-fetch + the dataviz
  baseline diff), each surfacing a real delta.

**User action item (an agent cannot do this):** privately preserve the frozen
`tmp_skills/` snapshot outside this public repo (the built-in half is version-locked
to Claude Code v2.1.202 and unrecoverable once the harness moves on). The manifest
verifies a future re-capture but is not itself the baseline text.
