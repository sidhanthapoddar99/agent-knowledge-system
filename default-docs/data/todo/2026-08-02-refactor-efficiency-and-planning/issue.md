## Goal

Two problems that turned out to be the same problem.

**1. Agents spend an order of magnitude more output on recording work than on
doing it.** Measured on a live consumer project over 24 hours: **8.8% of all
lines written were code.** The rest was tracker markdown (78.7%) and source
comments (11.9%). In the sharpest two-hour window, a run whose production change
was **five lines** produced **1,928 lines of agent log log** across 13 files, and
restated its three findings in eleven different places. Full numbers:
[the recording-overhead audit](./notes/10_efficiency-audit-2026-08-02.md).

**2. The plan has no home.** The one file that answers *"what is left, in what
order, who is blocked"* currently lives in `agent-memory/plans/` — a lifecycle
bucket for mutable agent scratch state, reached through a sidebar section named
after the agent rather than after the work. It has no index, no first-class
route, and no structure the framework knows about. So the most-read file in an
issue is the hardest one to find.

These are the same problem because **the log grew to fill the plan's absence.**
When there is nowhere structured to say "here is the state of the work", every
run says it again, in full, in its own folder.

## Why now

The cost is real and compounding, not theoretical:

- The tracker on the audited project is now **872 files / 132,567 lines / 7.6 MB**
  for one issue. No session can read it; it is write-only in practice.
- **588 of its 749 agent log files were written once and never touched again.**
- Roughly **282k tokens of markdown against 79k of code diff** in a single day —
  and each audit report is billed twice, once to write and once to read back.

## Shape of the work

| Stage | Subtask | Output |
|---|---|---|
| Diagnose | [Audit the efficiency losses](./subtasks/010_initial-research/010_audit-efficiency-losses.md) ✅ | The measured audit — **done** |
| Decide | [Brainstorm: cutting the recording overhead](./subtasks/010_initial-research/020_brainstorm-efficiency-remedies.md) | A proportionality rule that survives contact with a real run |
| Decide | [Brainstorm: the plans section](./subtasks/010_initial-research/030_brainstorm-plans-section.md) | The shape of `plans/` as a real section — **TBD, this is the open design** |
| Execute | [Execution](./subtasks/040_execution/00_overview.md) | Framework + CLI + skills + docs + the consumer-side fix |
| Ship | [Version bump to 0.7.0](./subtasks/050_version-bump.md) | `agent-ks` 0.7.0 |

The two brainstorms gate the execution group. Nothing under `40_execution/`
should start before the plans-section shape is settled — coding it first is how
you get a section the skill then has to apologise for.

## What "efficiency" means here, precisely

Not "write less." The audit's own finding is that the expensive thing is
**restatement, not detail** — the same fact written into `00_goal`,
`01_summary`, the milestone, the verdict, three scope reports, the subtask, the
plan file, and a 65-line source comment. Detail in *one* place is cheap and
valuable; the ninth copy is what costs.

So the target is:

- **One canonical home per fact**, with links from everywhere else.
- **Log size proportional to change size** — the current rules have no size
  input at all, which is the root cause.
- **Slots that may genuinely stay empty**, rather than a six-file floor per
  agent log that gets filled because a stub reads as unfinished.
- **Briefs summarised, not dumped** — why a run was commissioned and what it was
  meant to produce, not the agent prompt verbatim.

## Non-goals

- Reducing what agents *verify*. The audited run's audit found a real defect
  that had survived 3,834 tests. The verification earned its cost; the
  eleven-fold retelling of it did not.
- Deleting existing history. Old agent-log folders stay as they are — git and the
  tracker are the archive. This changes what gets written *next*.
