---
title: "Audit results — Fable skill review (verdict: ready after three fixes)"
---

## Overall verdict

**Close to canonical — ready after three fixes.** The hard parts all check
out: every settled decision is captured and correctly weighted (both publish
surfaces, sidecar contract, mode-choice doctrine with exact rationale, inline
variable contract with the standalone-independence argument, fallback-layer
carve-out, both design-system homes, validator + CLI loop, verify gate), all
verified line-level against the loader/route code — the palette claims even
reproduce numerically. Voice and triage shape are genuinely unified. Repo ↔
cache parity: zero differences. Plugin self-test: pass. Palette validator:
executes clean.

## Findings (ranked)

1. **SEVERE — false provenance declaration (public-repo consequences).**
   `references/dataviz/` is still ~70–82% near-verbatim upstream Anthropic
   text (verbatim runs up to 61 words) and `design-fundamentals.md` carries
   29–37-word lifted passages — while `PROVENANCE.md` + SKILL.md assert
   "rewritten, never pasted" (scripts sole exception). The main run's fixer
   claimed re-expression but the shingle analysis disproves it. Resolution
   per the settled rewrite-never-paste decision: genuine rewrite.
2. **SEVERE — ecosystem teaches a silently-broken value.**
   `agent-ks-docs/references/layouts/docs-layout.md:175` example uses
   `"theme": "adopts-site"` — a draft-era value the loader doesn't recognize;
   copiers silently get `self`. Fix to `"site"` (repo + cache).
3. **MODERATE — inline variable list drifts from `theme.yaml`** while
   claiming to mirror it: omits `--line-height-base` (required); includes
   `--display-*` and `--border-radius-full` (not in the contract). Same drift
   in publishing.md's duplicate table (which should become a pointer to the
   SKILL.md canonical list).
4. **MODERATE — the skill's only full sidecar example is unreachable and
   stale**: points at "this issue's" tracker fixture (deictic; absent in
   consumer installs) which still declares superseded `"self-world"`. Inline
   a canonical example / point at the shipped user-guide demos; fix the
   fixture to `"self"`.
5. **MODERATE — history narrations** ("the legacy `self-world` value…",
   "the older value…") in SKILL.md, publishing.md, and user-guide
   08_artifact-pages.md violate the skills-are-history-free rule — delete,
   keep loader tolerance silent ("any other value reads as `self`").
6. **MINOR** — `guide.ts` names `agent-ks-docs` (twice) as the tracker
   manual; should be `agent-ks-issues`. `embed_height` taught top-level in one
   skill, inside `artifact:` in the other (loader canonical: top-level);
   demo sidecar declares both. `agent-ks` CLI invoked but never located
   for cold agents. "Opaque `artifact:` block" overstates (framework reads
   `theme`). Palette hue-set origin (upstream reference set) deserves a
   one-line acknowledgment.

## Disposition

Fix run: `050_wf_audit-fixes/` (Fable-model agents). The full verbatim
report was returned in-session 2026-07-08; this file is the durable record.
