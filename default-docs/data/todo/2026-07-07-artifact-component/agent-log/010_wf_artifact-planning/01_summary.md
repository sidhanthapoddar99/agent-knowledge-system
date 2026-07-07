---
title: "Summary — ultracode planning run (complete)"
---

## What ran

Workflow `wf_57c44566-734` (2026-07-07): 8 agents, 4 phases
(Research → Write → Verify → Fix), ~794k subagent tokens, ~27 minutes.
Writers and critics were Opus at xhigh/high reasoning; the main session
scaffolded the issue by hand, orchestrated, reviewed, and validated.

## What it produced

The full planning depth of this issue — 11 files, ~17k words:

- `brainstorm/01_discuss_component-and-route-architecture.md` — 8 threads
  (scan packaging, sidecar contract, embed rendering, sandboxing, theming,
  route mechanics, reserved-URL guard, expand affordance), each ending in a
  recommendation, grounded in verified file:line references.
- `brainstorm/02_discuss_authoring-skill-design.md` — 10 sections designing
  the `artifact-authoring` skill: placement, triage wiring, table of contents,
  source-by-source convergence, adaptation layer, CDN stance, sidecar contract,
  design-system flows, bundled scripts, licensing stance.
- `notes/01_skill-sources-and-provenance.md` — capture provenance for all four
  sources + the three-way-diff upstream update protocol + baseline-preservation
  recommendation (private archive + public integrity manifest).
- `notes/02_settled-decisions.md` — the citable record: URL-as-primitive,
  affordances, sidecar-over-frontmatter, reserved `/artifacts` guard,
  first-party trust stance, and the named still-open threads.
- `subtasks/10_component` … `70_upstream-provenance` — seven cold-reader work
  orders with checkbox tasks and verification steps.

## Verification outcome

Six adversarial findings (one major: sidecar-naming drift across four files),
all fixed — detail in `102_verify-fix-review.md`. Tracker validator clean for
this issue.

## State handed off

Issue is `open`, planning complete, ready for human review of the recorded
decisions and then implementation. Open threads an implementer must resolve
are explicitly listed at the end of `notes/02_settled-decisions.md`.
