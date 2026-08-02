---
title: "20 — The agent-log structure (decided)"
---

# The agent-log structure

**Decided (sidhantha, 2026-08-02).** Graduated from
[thread 04](../brainstorm/04_discuss_agent-log-shape.md) and
[thread 05](../brainstorm/05_discuss_subagent-protocol.md). This is the spec the
execution subtasks build against.

## Vocabulary — say "agent log", not "activity"

**The unit is an agent log.** `agent-log/` holds agent logs, the way `subtasks/`
holds subtasks and `notes/` holds notes. The old word *activity* was the one
section name that did not match what it contained, and it cost a translation step
every time someone read the skill.

| Term | Means |
|---|---|
| **agent log** | one folder — `NNN_<kind>_<name>/` — recording one run with one goal |
| **child agent log** | an agent log nested inside another, for a sub-goal |
| **iteration** | one coherent round of work — a group of subtasks, executions and agents. The first two digits of a file's number |
| **iteration file** | the round's own file inside `working/`, written by the orchestrator |
| **producer file** | a file written by one agent that produced something substantial, sitting beside its iteration file |

The section folder stays `agent-log/` — renaming it would touch the loader,
routes, CLI and every consumer tracker for no gain. **Only the vocabulary
changes.**

## What a log is for — the acceptance test

Three purposes. The current six-slot model defeats all three, which is why it is
being replaced.

| Purpose | What the current model does instead |
|---|---|
| **1. Let the agent keep track of things** | 13 files, none authoritative — you must read all of them to know where you are |
| **2. Reduce token usage** | Triples it: findings written to a file, returned whole, then restated in a verdict |
| **3. Give Sid one conclusive summary** | `01_summary` competes with `00_goal`, the milestones, `04_benchmark` and the verdict — four candidates, no winner |

Any proposed rule is judged against these three.

## The shape

```
agent-log/
└── NNN_<kind>_<name>/              ← an agent log
    ├── settings.json               ← optional: status → colours the kind symbol
    ├── summary.md                  ← REQUIRED. The one conclusive file.
    ├── working/                    ← one file per iteration, plus producers'
    │   ├── 010_<round>.md
    │   ├── 011_<what-it-produced>.md
    │   └── 020_<round>.md
    └── debrief/                    ← what leaves this run
        └── 01_handover.md
```

Nested — **a sub-goal becomes a child agent log**, same shape recursively. The
parent folder describes the larger goal; each child describes one goal inside it.
A plan's stages are the common case, **not the only one** — a long-running loop,
a programme, or any investigation that decomposes into named sub-goals nests the
same way.

`working` and `debrief` are **reserved names**; anything matching
`NNN_<kind>_<name>` is a child agent log. No ambiguity at read time.

## Iteration file vs child agent log — the discriminator

> **Does it have its own goal?**
> Yes → **child agent log** (its own `summary.md`).
> No, it is work done toward the parent's goal → **iteration file** in `working/`.

**This is the only rule, and it deliberately never mentions plans.** A ten-stage
plan gives ten child agent logs; a long-running loop with four named goals gives
four; the agents running inside any of them give iteration files. Nesting depth
is whatever the goal decomposition already is.

**Nesting may mirror a structure that exists; it may never invent one.** A child
agent log that has no goal of its own is an iteration file wearing a folder, and
that is how the old `09_rf_…/022_wf_…/113_…` trees happened — depth encoding
*when* work occurred instead of *what it was for*.

**Milestone files are gone.** Their job is done by iteration files and child
agent logs.

---

# `summary.md`

Single-file convention, always present. **Five sections, all `#` level 1, in this
order.** Nothing else.

```markdown
---
title: "Summary"
---

# State

# Goal and Trigger

# Task List

# Out of Scope

# Outcome Summary
```

| Section | Holds | Changes |
|---|---|---|
| **State** | **Summary of current state** — where this run is right now and what happens next, in a few lines. Not a status token; the token is in `settings.json`. | **Live** — the only section rewritten during the run |
| **Goal and Trigger** | Purpose in plain language, context, expected outcome. Trigger only when it is not obvious. | Written once |
| **Task List** | The run's checklist, **headed by its references** — the plan step and subtask this executes against, plus scoping notes/brainstorms. References live here because they are *what the tasks execute against*. | Ticked as work lands |
| **Out of Scope** | What this run deliberately does not touch. | Written once |
| **Outcome Summary** | **One sentence and a link.** Never a paragraph. | Written at close |

**State first, deliberately.** Opening `summary.md` and knowing where things are
without scrolling is purpose 1 and purpose 3 in one section.

**No notes section.** If it is worth writing, it goes in `debrief/`.

**The Outcome Summary cap is a rule, not a style preference** — it is the seam
most likely to regrow the whole story. One sentence orients; a paragraph is a
copy of the iteration that produced it.

**The task list is run-local and disposable.** If an item outlives the run it
becomes a subtask.

---

# `working/`

## One iteration, one file — and an iteration is a GROUP

**Decided by Sid, 2026-08-02** — see
[the responsibility split](./60_section-responsibilities.md).

**The atomic unit is an iteration, not an agent.** An iteration is a coherent
round of work and covers a **group** — of subtasks, of executions, of agents.
The orchestrator writes the iteration file from what the round produced.

**A file per agent is not created.** An agent that produced something
substantial — an audit, a research survey, a measured comparison — gets its own
file, because that output has to live somewhere and re-typing it is the
duplication this issue exists to remove. An agent that did a small piece of work
returns, and the orchestrator records the outcome in the iteration file.

**File count scales with what was produced, not with how many agents ran.**

The concurrency constraint the earlier mailbox rule protected is unaffected:
concurrent producers each write their own file, and the iteration file has
exactly one writer.

## Numbering — `NNN_<task-name>.md`

**First two digits = the iteration. Last digit = which file within it** — `0` for
the iteration file itself, `1`…`9` for a producer's own file.

```
working/
├── 010_audit-round.md              ← iteration 01 — the orchestrator's file
├── 011_scope-a-byte-surface.md     ← a producer within it: an audit report
├── 012_scope-b-blast-radius.md     ← a producer within it
├── 020_fix-round.md                ← iteration 02 — no producer files needed
└── 030_battery.md                  ← iteration 03
```

**`working/` is FLAT — no subdivision.** The numbering is what expresses "this
iteration produced several files": `011`, `012` sit beside `010`. A folder per
iteration would be a second way to say the same thing.

Add a folder only when a **single producer** makes several artifacts, and then it
is `NNN_<name>/` holding them — still flat at the iteration level.

If a stage needs so many agents that a flat `working/` becomes unreadable, that
is evidence the **stage** should be two child agent logs, not that `working/`
should grow a tree.

## An iteration file is SELF-CONTAINED — the required head

**Decided (sidhantha, 2026-08-02).** A file that says only what an agent did is
unreadable six months later, and unreadable *now* to any other agent handed it as
input. Every iteration file opens with four `#` sections. Nothing else is
required; everything after them is free-form.

```markdown
---
title: "Scope A — the byte surface"
status: done           # the canonical 7 — see below
agent: sol             # who wrote it
---

# Goal
The problem this agent was given, in one or two lines. Stands alone — a reader
who has opened nothing else understands what was being solved.

# Inputs
What to read first, as paths. `none` when there are none.

# Expected Outcome
What "done" looks like for this kind of work — see the table below.

# Outcome
What actually came back. Written by the agent.
```

**The head is written by the orchestrator.** Goal, Inputs and Expected Outcome
are the work order, filled in when the file is created; Outcome is filled in when
the round lands. On a **producer file** the orchestrator still writes the head
and the producing agent writes Outcome and below — the file is then the
assignment *and* the result, so nothing has to be restated in a prompt or a
return value.

### `status` means "did the agent finish" — not what it concluded (Sid)

**Decided 2026-08-02.** Iteration files use the **canonical seven**
(`src/loaders/issue-status.ts`), same as issues, subtasks, plan stages and agent
logs. There is now **exactly one status vocabulary in the tracker.**

| Value | On an iteration file |
|---|---|
| `open` | created and assigned, not started |
| `in-progress` | running |
| `input-needed` | the agent stopped to ask; the question is in the body |
| `done` | **the agent finished its assignment** |
| `dropped` | the agent did **not** finish — crashed, refused, superseded |

All seven are valid because it is one vocabulary; those five are the ones that
will actually occur.

**What the run FOUND goes in `# Outcome`, one line below.** So an audit that
finished and found two real defects is `status: done` — the agent did its job.
An audit whose job was refused mid-flight is `status: dropped`, with the reason
in `# Outcome`.

This is the distinction that made a separate `success | failed` vocabulary look
necessary: it was conflating *did the agent deliver* with *was the news good*.
Splitting them removes the need for a second set of words, and removes the
collision where `not-started` meant a **category** in one place and a **status**
in another.

**`# Inputs` closes the misinformation gap.** Without it, "read `031`–`034`
before writing the verdict" lives only in a prompt, where it can be forgotten and
leaves no trace that it was ever said. A review that never read one half of a
pair is exactly the failure the paired-audit loop exists to prevent, and it is
invisible after the fact unless the inputs are on the file.

### What each kind of work unit is expected to produce

| Work unit | Expected Outcome |
|---|---|
| **planning** | the ordered task list the later units execute against |
| **execution** | the change, and what it touched |
| **audit / review-by-reading** | findings — each with `file:line`, the failure scenario, and whether it was reproduced |
| **decide** | a verdict per finding: fix / reject / defer / not-ready |
| **fix** | the fix, and which finding it closes |
| **research** | findings and a recommendation |
| **benchmark** | before-and-after numbers, with units |
| **test / battery** | survivors and kills, the exact command, the collected count |

State the expected outcome even when it is obvious. It is the line that makes a
half-finished file legible as half-finished.

## What the body holds

**Thin but complete.** Essentials plus references — never implementation detail,
never a second copy of anything.

- What it did.
- **The outcome, in the broad sense** — plus benchmark numbers if it produced any.
- **Issues found: one line each, plus a pointer.** *"Found a refusal path that
  deletes before the user has the bytes — detail in
  `debrief/02_recovery-gaps.md`."* Never the full write-up in place.

**The iteration number is the filename (`011_`) and is never repeated in
frontmatter.** Same rule as everything else here — the filename owns it.

The test: **an iteration file is complete because of what it points at, not
because of what it repeats.** A reader can follow it; a reader is never made to
read the same thing twice.

---

# `debrief/` — what leaves the run

**Renamed from `notes/` (sidhantha, 2026-08-02.)** Two folders called `notes/`,
one at issue level and one inside every agent log, is a collision that costs a
disambiguating clause every time either is mentioned — and it invited the wrong
routing, because "notes" sounds like the issue's notes.

**`debrief` is the word because the folder is not one thing.** It is everything
worth telling someone after the run: what was learned, what is still open, what
someone must decide. A debrief covers all of that in ordinary English, and
nothing else in the framework is called that.

```
debrief/
├── 01_handover.md          ← conventional landing file
├── 02_questions-for-sid.md
├── 03_findings.md
└── 04_<topic>.md
```

What it holds — deliberately broader than the old handover-only reading:

| Content | Example |
|---|---|
| **Handover** | what the next run must know to pick this up |
| **Questions for the user** | a decision the run could not take; asked before proceeding |
| **Findings and analysis** | what the run learned, including finished analysis files |
| **What is fixed and what is not** | the honest state of the change |
| **Lessons** | what to do differently; what failed and should not be retried |
| **Mid-run observations** | something noticed while working that matters later, but not now |
| **Caveats, dead ends, out-of-scope discoveries** | anything deliberately not done |

**Written during the run, not only at the end.** A mid-run observation goes in
when it is noticed — that is the whole reason the folder is not called
`handover/`.

`01_handover.md` is a **convention, not a mandate** — when there is only one
thing to say, it goes there. No slot is required to exist, which is the whole
lesson of the old six.

**Anything actionable leaves the log** and becomes a subtask or a dump entry; the
debrief keeps the pointer. A bug recorded only as log prose dies in the log.

**Where `debrief/` ends and the issue's `notes/` begins** — the test is
**audience**:

| Question | Home |
|---|---|
| Does the next run of *this* work need it? | the agent log's `debrief/` |
| Does anyone touching *this issue* need it, ever? | the issue's `notes/` |

Decision-bearing analysis that later work will cite graduates to the issue's
`notes/`; the debrief keeps a one-line pointer.

---

# Three cases the old model got wrong

These are the biggest content categories by volume, and each had a home outside
the standard slots. Naming them explicitly, because a structure that does not
say where they go will grow a seventh slot again.

**An audit report is an iteration file.** One auditor, one file in `working/`.
It is bound by *thin but complete* like any other: findings with `file:line` and
the reproduction, one line each, detail pointed at rather than inlined. The
`<agent-log>/audit/<scope>.md` convention — a seventh slot invented outside the
six — is absorbed here. Audit reports were **46.7% of all writing**; this is the
single largest thing the new shape has to hold.

**A pair is two files, never one.** Two reviewers on one concern are two agents,
so they get two files sharing the work-unit digits — `011_scope-a-reader.md` and
`012_scope-a-executor.md`. Merging them loses which half found what, and findings
merge as a **union, not a vote**: one half reproducing a crash is not outvoted by
the other half finding nothing. That comparison needs both files to survive.

**An external tool gets a named owner who writes its file.** Where one half is
something that cannot write into the tracker itself — a separate CLI, a hosted
model, anything outside the agent runtime — a named agent owns the job, waits for
it to reach a terminal state, and writes its iteration file from the returned
result. The file's `agent:` field names the **tool**, because that is whose
finding it is; the owner is accountable for the file existing. A finding that
lives only in a job record dies with the run.

**`summary.md` IS the brief.** A run-specific brief does not get its own file.
`# Goal and Trigger` + `# Task List` + `# Out of Scope` already *are* the brief —
point the agent at `summary.md` and spend the prompt on the delta. Standing rules
are referenced from `agent-memory/`, never re-typed
([thread 05](../brainstorm/05_discuss_subagent-protocol.md)). This retires the
"keep the rephrased brief as its own numbered file in `03_working/`" convention
that produced 160 committed brief files.

**Benchmarks split by weight.** The *numbers* go in the iteration file that
produced them. The *drivers, traces and raw dumps* go to the code repo's
gitignored benchmark directory — never the tracker. Unchanged rule; stated here
because the iteration file is now where the numbers land.

---

# The worked example — SHIP THIS IN THE SKILL

> [!IMPORTANT]
> **This tree is a deliverable, not an illustration.** It goes into
> `agent-ks-issues` as the agent-log worked example, because it is the case that
> breaks every naive reading of the rules at once: a plan, a multi-stage
> overnight loop, several workflows, and mixed work units inside each. Owned by
> [`040_skill-efficiency-rules`](../subtasks/040_execution/040_skill-efficiency-rules.md).
> The example pair rule in
> [skill authoring](./30_skill-authoring-rules.md) still applies — this is the
> **large** end of the bracket; the small end is a two-file agent log for a
> one-round change.

**The scenario.** A plan with 8 stages, 4–5 subtasks each. An overnight loop
covering stages 3–5. The loop runs 5 workflows. Each workflow has planning,
execution, audit, review, fix and benchmark units inside it.

**The mapping decision comes first, because it is the whole answer:**

- **The plan and its 8 stages do not appear in `agent-log` at all.** A plan is a
  *schedule* — order and blocking. `agent-log` is *execution*. The plans section
  owns the stages.
- **The overnight loop is one agent log** — one run, one starting state, one
  outcome.
- **Each workflow is a child agent log** — it has its own goal.
- **The workflow's stages are NOT folders.** They are the work-unit digits. That
  is exactly what the numbering was built for.

```
data/tasks/2026-08-02-nsd-phase-2/
├── plans/
│   └── 020_plan_decoder-and-retention.md    # the 8 stages: order + what blocks what
├── subtasks/                                # the 4-5 per stage — filed by CATEGORY, not order
├── notes/                                   # analysis that outlives the run
└── agent-log/
    └── 030_lp_overnight-stages-3-5/         # ── the loop: one run, one goal
        ├── settings.json                    #    {"status": "done"}
        ├── summary.md                       #    State tells you where it got to
        ├── working/                         #    the LOOP's own files — 1 or 2, no more
        │   └── 010_round-ledger.md          #      which workflow ran when, why order changed
        ├── debrief/
        │   ├── 01_handover.md               #    what the next overnight run must know
        │   └── 02_questions-for-sid.md      #    decisions the loop could not take
        │
        ├── 010_wf_s3-decoder-swap/          # ── workflow 1 (serves plan stage 3)
        │   ├── settings.json
        │   ├── summary.md                   #    this IS the brief the agents were pointed at
        │   ├── working/                     #    FLAT. first 2 digits = iteration, last = file
        │   │   ├── 010_plan-the-slice.md    #      iteration 01
        │   │   ├── 020_execution.md         #      iteration 02 — two executors ran; they
        │   │   │                            #      produced CODE, so no files of their own
        │   │   ├── 030_audit-round.md       #      iteration 03 — concern + merged verdict
        │   │   ├── 031_audit-bytes.md       #        producer: the byte-surface report
        │   │   ├── 032_audit-blast.md       #        producer: the blast-radius report
        │   │   ├── 040_fix-round.md         #      iteration 04 — what was fixed, what was not
        │   │   ├── 050_bench-before-after.md#      iteration 05 — the numbers
        │   │   └── 060_research-codecs/     #      one producer, several artifacts → a folder
        │   │       ├── 01_findings.md
        │   │       └── 02_decision-tree.mmd #      mermaid renders as a log entry
        │   └── debrief/
        │       └── 01_handover.md
        │
        ├── 020_wf_s3-journal-compat/        # ── workflow 2, same shape
        ├── 030_wf_s4-retention/             # ── workflow 3 (stage 4)
        ├── 040_wf_s4-cleanup-accounting/    # ── workflow 4
        └── 050_wf_s5-concurrency/           # ── workflow 5 (stage 5)
```

**The plan stage survives as a label, not a folder** — in the workflow's name
(`s3`, `s4`, `s5`) and in the loop's Task List. A folder would be a second place
storing what the plan already owns, and it would cost a nesting level the depth
budget below cannot spare.

**What the example is there to teach**, stated so it is not lost when someone
shortens it:

1. A schedule never becomes a folder tree.
2. Iterations are digits, not directories.
3. A file exists because something was **produced**, not because an agent ran.
   Two executors writing code produce one iteration file between them; two
   auditors writing reports produce two files plus the iteration's own.
4. One producer making several artifacts is the only reason to nest inside
   `working/`.
5. Depth stops at four.

---

# Limits the loader already imposes — measured 2026-08-02

Checked against `astro-doc-code/src/loaders/issues.ts`, because a nesting rule
that the renderer silently drops is worse than no rule.

**Depth is capped at 5 folder levels below `agent-log/`, and overflow is
SILENT.** `MAX_SUBFOLDER_DEPTH = 5` (`order-prefix.ts`); anything deeper is
`console.warn`-ed during the build and **skipped** — no page, no validator error,
nothing a reader would notice. The recommended convention is 3.

Budget for the deepest realistic run:

| Segment | Example | Level |
|---|---|---|
| agent log | `030_lp_overnight/` | 1 |
| child agent log | `010_wf_decoder-swap/` | 2 |
| `working/` | | 3 |
| an agent's artifact folder | `071_research-codecs/` | 4 |
| — | file sits here | — |

So **two levels of child agent log is the working ceiling**, not five. State it
as a budget in the skill rather than leaving agents to discover it by having a
file vanish. And the validator should **error** on overflow rather than the
loader warning to a console nobody reads — failing loudly over a plausible wrong
answer.

**Diagrams are first-class in `agent-log`; HTML artifacts are not.**
`readAgentLogs` accepts `.md` plus `.mmd` `.mermaid` `.dot` `.gv` `.excalidraw`
and renders them as log entries. `.html` artifacts are accepted **only in
`notes/` and `brainstorm/`** (`issues.ts:742`) — deliberate, and it stays. A run
that produces a dashboard or report artifact **graduates it to the issue's
`notes/`** and links from the iteration file.

**Iteration-file frontmatter needs no loader change.** `readAgentLogs` already
reads `agent`, `status`, `date` and `color` from any agent-log markdown file. The
only casualty is `iteration:`, which becomes dead once the filename owns the
number. That removes work from
[`015`](../subtasks/040_execution/015_code-agent-log-settings.md) — frontmatter is
already supported; only the folder-level `settings.json` is new.

# Where research, analysis and diagrams live

The gap the *thin but complete* rule leaves open: an agent that produces a
research survey, a benchmark analysis or a diagram cannot inline it, and must not
lose it.

| Output | Home |
|---|---|
| One producer, several artifacts (survey + diagram + data) | `working/NNN_<name>/` — the folder form, one folder per producer |
| A diagram supporting one iteration | `working/NNN_<name>.mmd` beside the iteration file, or inside its folder |
| Analysis the run wants to pass forward | the agent log's `debrief/` |
| Decision-bearing analysis another run will cite | **the issue's `notes/`** — the iteration file keeps a one-line pointer |
| An HTML dashboard or report | **the issue's `notes/`** — agent-log will not render it |
| Raw drivers, traces, dumps | the code repo's gitignored benchmark directory |

**The discriminator is audience, not size.** If only this agent needs it, it
stays in `working/`. If the run wants to pass it forward, `debrief/`. If a later
run or a reader of the issue needs it, the issue's `notes/`.

# What this spec does NOT cover

Scoped deliberately, so the gap is visible rather than assumed closed:

- **Prose density.** *"Detailed, line-rich records"*, *"never a bare dump"* and
  *"whenever in doubt, persist"* are instructions about how to write, not about
  where things live. They belong to the rule set in
  [`040_skill-efficiency-rules`](../subtasks/040_execution/040_skill-efficiency-rules.md),
  which is **still open**. This structure removes the *slots* that invited
  restatement; it does not by itself stop a single file being an essay.
- **Migration of existing agent-log FOLDERS.** History stays as written; this
  governs what is recorded next. Restructuring old folders is not proposed — a
  script that did it would rewrite the record rather than migrate it.

  > [!IMPORTANT]
  > **This is not true of the status VALUES, and an earlier draft said it was.**
  > The validator accepts fourteen aliases today (`success`, `failed`, `wip`,
  > `complete`…); moving to the canonical seven makes 78 files in this repo alone
  > invalid. That needs a real migration —
  > [`100`](../subtasks/040_execution/100_migration-script.md). Structure needs
  > none; vocabulary does.

Logs need no decay rule: iteration files are write-once by nature, and `# State`
is the only live text in an agent log.

# Where this change lands

Counted 2026-08-02. Every place the current shape is encoded.

| Where | Files | What must change |
|---|---|---|
| **Skill** — `plugins/agent-ks/skills/agent-ks-issues/` | `SKILL.md`, `references/20_sections/24_agent-logs.md` (primary), `00_anatomy/00_overview.md`, `00_anatomy/01_folder-layout.md`, `00_anatomy/03_overall-issue-tracker-vocabulary.md`, `10_writing/10_writing.md`, `60_examples/63_agent-loops.md`, `20_sections/26_agent-memory.md` | The six slots, the milestone rhythm and frontmatter, **the word *activity* → *agent log***, **`notes/` → `debrief/`**, the iteration-file head, the worked example |
| **CLI** — `plugins/agent-ks/skills/agent-ks-docs/scripts/` | `issues/new-agent-log.mjs` (**seeds the six slots**), `issues/check.mjs`, `_manifest.mjs` | Scaffold `summary.md` + `working/` + `debrief/` + `settings.json`; emit the iteration-file head; validate the new shape and the reserved names |
| **Framework** | `astro-doc-code/src/layouts/issues/default/guide.ts` (lines ~133–175) | The anatomy tree, **the six-slot list — a fourth home of the "kept present even when blank" floor**, the whole milestone block, the `#N` badge tinting, the milestone frontmatter table. Line-by-line in [the framework spec](./40_agent-log-settings-framework-spec.md) |
| **User-guide prose** | `19_issues/05_sub-docs/05_agent-log.md` (primary), `19_issues/03_folder-structure.md`, `19_issues/01_overview.md`, `19_issues/07_ui/02_detail-view.md` | Same content for humans, same vocabulary change |
| **`~/.claude/CLAUDE.md`** | line ~78 *"an activity folder holding one run's goal, task list and **milestones**"*; line ~298 *"Instructions as files, prompts as pointers"* | Milestones no longer exist; the word *activity* goes; the brief rule becomes "summary.md is the brief" |
| **Consumer — `neurasutra-docs`** | `memory/standing-rules.md:16,32–33,35`, `memory/orchestration.md:34,60,73`, `memory/codex-sol.md:75,101` | *"Keep all six present even when blank"* (the six-file floor), `<activity>/audit/<scope>.md`, *"keep the rephrased brief in `03_working/`"*, milestone references, the vocabulary |

**`~/.claude/CLAUDE.md` is Sid's personal global file** — propose the diff and get
explicit sign-off; it governs every project on the workstation, not just this one.
Subtask:
[`020_update-global-claude-md`](../subtasks/040_execution/020_update-global-claude-md.md).

**The consumer is LAST.** Its `memory/` links upstream rather than copying, so
fixing it before the skill lands puts a stale copy in the field. Subtask:
[`060_sidequest-neurasutra-memory`](../subtasks/060_sidequest-neurasutra.md).

# Decision routing

| Scope of the decision | Home |
|---|---|
| Within a single iteration — *"pick A, B, C or D here"* | **the iteration file** |
| Affects the rest of this run | **the agent log's `debrief/`** |
| Affects more than one run | **the issue's `notes/`** |

This also settles the decision-home gap in
[thread 02](../brainstorm/02_discuss_section-model-and-leaks.md): the issue's
`notes/` is where durable decisions live. Decisions spread across iteration files
are unfindable, which is how findings were lost before.

# `settings.json` — status as data

Per agent log, and per child agent log. Optional.

- **Vocabulary:** the issue vocabulary **minus `blocked` and `review`** — those
  mean nothing for a run. So: `open`, `in-progress`, `input-needed`, `done`,
  `dropped`.
- **Not inherited.** Each folder's status is set independently.
- **Optional.** Absent renders grey. **A structural convenience, not a hard
  constraint** — nothing fails because it is missing.
- **Status only — it does not carry the kind.** The kind is the two-letter code
  in the folder name (`NNN_<kind>_<name>`), which is what draws the symbol.
  `settings.json` gives that symbol a **colour**. Free metadata is permitted,
  nothing else is read.

**Two carriers, no overlap:** `settings.json` is per **folder** (an agent log or
a child agent log); frontmatter is per **file** (an iteration file). Neither
duplicates the other, and neither repeats what the name already says.

> [!IMPORTANT]
> **The skills must say this explicitly:** `done` on an *agent log* means the run
> finished, and an agent may set it. `done` on a *subtask* is human-only and
> means the work is signed off. Same word, same vocabulary, opposite authority.
> Left implicit, either agents never close their own logs or they start
> self-certifying subtasks.

Uninherited and optional is a deliberate trade — status can drift, accepted
because it is display convenience rather than a load-bearing invariant.
**Through the skills it is nonetheless the dominant convention.**

# When an agent log is opened at all

**When work is delegated, or when it runs over multiple rounds.** Anything the
main agent does inline gets a line in the plan and no folder. Without this, three
slots become a three-file floor for a one-line change.

# The rule underneath all of it

> **No file stores a fact another file owns.**

Every cut above is an instance: the Outcome Summary links rather than restates;
an iteration file points at the debrief that holds the detail; actionable items
leave for the subtask that owns them; standing rules are referenced, not
re-typed. Where this is enforced structurally, duplication is impossible; where
it is only written down, it decays. Judge every future rule by which of the two
it is.

**The one exception, and it is deliberate:** the iteration file's `# Goal` and
`# Expected Outcome` restate the assignment the orchestrator already knows. That
is bought knowingly — a file that cannot be read alone is a file that gets
re-derived from a transcript, which costs more than the two lines.
