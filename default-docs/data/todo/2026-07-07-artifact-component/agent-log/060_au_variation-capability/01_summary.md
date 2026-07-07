---
title: "Audit results — variation-set capability (verdict: material gap, add a section)"
---

## What ran

Two parallel Opus auditors (2026-07-08), read-only, complementary lenses:
a cold-executor simulation (Opus profile + Sonnet-medium profile walking the
skill to plan "5 mobile-nav options, interactive, pick one") and a 7-point
pattern-coverage scorecard against the skill + the upstream `tmp_skills/`
snapshots. Both returned full reports in-session; this is the synthesis.

## Converged verdict

**Material gap — the skill cannot yet reliably produce the variation-set /
options-explorer pattern, and the failure is profile-asymmetric:**

| Executor | Verdict |
|---|---|
| Opus | insufficient-with-gaps — recovers by inventing well (knows the pattern from experience) |
| Sonnet-medium | **insufficient** — the defining qualities are unwritten and it cannot infer them |

The three load-bearing absences (both auditors independently):

1. **Interaction-fidelity bar — missing entirely.** Nothing says variations
   must be *operable, not mocked* ("what's interactive should LOOK
   interactive" is appearance-only; the static-states content rule nudges
   *toward* mocks). Decisively: the §3 verify gate never exercises
   interactions — **a static mock passes verification clean**, so the gate
   certifies the wrong thing as done.
2. **One-artifact-N-variations — actively mis-signposted.** design-systems.md
   Home A says "keep each option a self-contained artifact" (per-option
   files, correct for competing *systems*) — a literal reader emits 5 files
   for a single-element comparison, losing head-to-head comparability.
3. **Shared fixture — missing.** No concept of rendering all options inside
   one realistic target-app frame. (The adjacent theme nuance is the skill's
   STRONGEST coverage: UI/UX deliberation → always `self`, even when the
   target theme matches the engine's — fully stated.)

Secondary: no sidecar convention for declaring the options
(`type: "variation-set"`, `options` list, `recommendation`, `decision`
status); in-artifact labeling/pick-affordance guidance thin; the §0
"lean utilitarian, don't over-design" governor risks undershooting this
pattern's editorial-grade polish bar.

Coverage scorecard: rows 1 (structure) and 5 (decision framing) ABSENT;
row 2 (fidelity) weakly implied; rows 3-nuance and 6 (lifecycle: brainstorm/
home, graduation, delete-not-narrate for rejected options) STATED. Row 7:
**no upstream signal was lost** — none of the four sources carried this
pattern; it's a genuine under-development shared by all of them, not a
convergence regression.

## Recommended remedy (synthesized from both proposals)

One new **"Variation-set / options-explorer artifacts"** section, placed in
`references/design-systems.md` (broadening that file's remit — it already
owns multiple-options + two-homes + graduation + always-`self`, so the
machinery is shared, not duplicated), ~40–60 lines: what-and-when (explicit
contrast with Home A's per-option files), structure-by-count (≤3 stacked /
4–6 grid / 6–10 switcher with persisted selection), the operable-not-mocked
fidelity bar, the shared fixture rule, sidecar declaration
(`type: "variation-set"` added to the enum; `options` + `recommendation` +
`decision` keys), lifecycle one-liner. Plus four hooks elsewhere: a SKILL.md
triage row (without it a cold agent never finds the section), a §1
cross-link, a §3 verify-gate line ("exercise every variation's interactions —
a static mock passes Styled/Complete/Plausible but fails the pattern"), and
a §0 note that an options-explorer is editorial-grade decision tooling (the
don't-over-design governor doesn't apply).

## Disposition

Awaiting triage with sidhantha on subtask
[100](../../subtasks/100_variation-capability-audit.md). If accepted, author
after the `050_wf_audit-fixes` run lands (same files in flight), repo + cache
parity.
