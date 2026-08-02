---
title: "Number the agent log's own slots"
status: review
---

# Overview

An activity's three slots are now numbered, and "slot or child activity?" is a
question about a number rather than a list of names.

```
010_lp_implement/
├── 01_summary.md        ← was summary.md
├── 02_working/          ← was working/
├── 03_debrief/          ← was debrief/
└── 100_wf_child/        ← a child activity: prefix ≥ 100
```

**Sid, 2026-08-03:** *"agent log — summary → 01 summary, working → 02 working,
debrief → 03 debrief. subsequent nested agent logs NXX where N>=1 thats it."*

**Done when** the convention is live in the loader, the sidebar, the CLI, the
in-app guide, the skill, the user-guide and the fixtures; a consumer tracker can
be converted by a script rather than by hand; and the script is control-tested.

# References

- The spec, written before any work and used as the agents' brief:
  [the numbering spec](../notes/80_agent-log-numbering-spec.md)
- The round: [numbering the slots](../agent-log/020_wf_ship-the-split/02_working/130_agent-log-slot-numbering.md)
- The design record this revises: [agent-log structure](../notes/20_agent-log-structure.md)
- Follow-up this turned up: [the using-with-ai page](./110_using-with-ai-page-stale.md)

# Todo list

- [x] Loader: the `{working, debrief}` name set → `AGENT_LOG_CHILD_MIN_PREFIX`
      and `isAgentLogSlotFolder()`
- [x] Sidebar: the *pin `summary.md` first* sort rule **deleted** — `01 < 02 <
      03 < 100` already sorts them
- [x] CLI: `new-agent-log` scaffolds `01_summary.md` and refuses to number a
      child below 100; `new-iteration` writes into `02_working/`
- [x] Validator: the same arithmetic, plus an unnumbered-slot warning naming the
      exact rename
- [x] In-app guide, skill (7 files), user-guide + the sidebar legend artifact
      (12 files) — three background agents in parallel on prose
- [x] Migration `0.1.4_agent-log-slot-numbering.py` — renames **and** rewrites
      inbound links, skips legacy six-slot logs, reports rather than moves a
      child numbered below 100
- [x] Control harness, 26 assertions including a decoy that a naive
      find-and-replace would break
- [x] The renames themselves, run by one actor sequentially
- [ ] **Sid: the screenshot needs recapturing.**
      `user-guide/19_issues/assets/demo-agent-log.png` shows the old slot names.
      Prose cannot fix an image; the alt text has been softened to wording that
      is true under both shapes so nothing reads as a lie in the meantime

# Outcomes and Next Steps

## What the numbering bought, beyond consistency

| Before | After |
|---|---|
| `new Set(['working','debrief'])` in the loader **and** the validator | one named constant + one predicate per side |
| A fourth slot = a code change in two files | `04_` |
| Read order enforced by a hand-written *pin summary first* rule | the prefix. **The rule was deleted, not renamed** |
| A child activity could never be *named* `working` | no such restriction — and nobody had written the old one down |

The last row is the kind of thing this issue exists to find: a real constraint,
enforced by code, documented nowhere, discovered only by replacing the mechanism
that caused it.

## The parallelism, and the one thing that could not be parallelised

Three background agents ran on prose — user-guide + dev-docs, the skill, and
this issue's notes + subtasks. Code, CLI, guide, migration and **every rename**
stayed with the orchestrator.

**Renames cannot run concurrently with prose edits, and this was measured rather
than assumed.** `agent-ks move` rewrites links across the whole content root;
nine files inside the agents' scopes contained links into folders being renamed.
Two link-aware moves in flight each rewrite files the other is mid-way through,
and the loser is silently corrupted. The renames waited.

## A side effect that fixed a recorded compromise

[The ordering label](./080_ordering-labels.md) shipped with one deliberate
under-report: a round file produced the label `090` rather than `020/090`,
because the unprefixed `working/` segment ended the walk, and fixing it would
have put tracker knowledge into a library the docs side shares.

`02_working/` carries a prefix, so the same purely-local rule now returns
`020/02/090`. **The special case was removed rather than added to.** Nothing
needs fixing as a consequence: the validator reports zero ordering-label
warnings, because no link carries a label yet — which is also the first evidence
that Sid's no-backfill decision cost nothing.

## What the control harness caught

The migration's first control run failed one assertion, **and the assertion was
what was wrong.** I predicted three renames; the script correctly planned five —
child activities have their own three slots, which is what makes them
activities. The expectation is now enumerated by path rather than counted, so it
cannot be satisfied by the script finding a different five.

The decoy case is the one worth keeping: a `notes/summary.md` and a link to it,
which a naive `summary.md → 01_summary.md` replace would break, with nothing
downstream noticing until someone clicked it.
