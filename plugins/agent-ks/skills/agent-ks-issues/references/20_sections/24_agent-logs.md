# Agent logs — `agent-log/` — execution and outcome


**One purpose in two sequential halves:** the run is carried out here, round by round,
and its outcome lands here when it finishes. It is also your own workspace — somewhere
to organise, and to continue an iterative loop across rounds.

**Read the agent log before starting work.** Don't repeat an approach that already
failed.

| Holds | Does not hold |
|---|---|
| The **concern** — what this run is trying to solve | **The scope.** That is the subtask's |
| The **reason it was started** — essential for ad-hoc work like an audit, which no subtask covers | The subtask's details, re-typed |
| The **execution** — each round, what it did, visible while it runs | The **order** of rounds as a schedule — that is the plan's |
| **What is solved**, and what is not | How the code was edited, step by step |
| **What broke as a result**, and what problems now exist | Twenty lines explaining two lines of code |
| **New todos** the run generated | Its own list of micro-steps |
| A todo list that **references** subtasks or plan stages | |

**The line:** the agent log carries **execution**, not **scope**. Code is easier to do
than to explain.

## When an agent log opens at all

> **When work is delegated, or when it runs over multiple rounds.**

Nothing else opens one. A change you make inline gets a line in the plan and no folder.
Without this rule, three files become a three-file floor for a one-line change.

## Vocabulary

| Term | Means |
|---|---|
| **agent log** | one folder — `NNN_<kind>_<name>/` — recording one run with one goal |
| **child agent log** | an agent log nested inside another, for a sub-goal |
| **iteration** | one coherent round of work — a group of subtasks, executions and agents |
| **iteration file** | the round's own file in `working/`, written by the orchestrator |
| **producer file** | a file written by one agent that produced something substantial, beside its iteration file |

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
    ├── debrief/                    ← what leaves this run
    │   └── 01_handover.md
    └── 010_wf_<sub-goal>/          ← a child agent log — same shape, recursively
```

`working` and `debrief` are **reserved names**; anything matching `NNN_<kind>_<name>` is
a child agent log.

Kind codes: `lp` loop · `au` audit · `rf` refactor · `it` iteration · `wf` workflow.
Custom codes via `agentLogKinds` in the issue's `settings.json`.

### Iteration file, or child agent log?

> **Does it have its own goal?**
> Yes → **child agent log**, with its own `summary.md`.
> No, it is work done toward the parent's goal → **iteration file** in `working/`.

That is the only rule. A ten-stage plan gives ten child agent logs; a loop with four
named goals gives four; the agents running inside any of them give iteration files.

**Nesting may mirror a structure that exists; it may never invent one.** A child agent
log with no goal of its own is an iteration file wearing a folder.

**Depth budget — the loader silently drops anything deeper than 5 levels below
`agent-log/`.** Two levels of child agent log is the working ceiling:

| Segment | Level |
|---|---|
| agent log — `030_lp_overnight/` | 1 |
| child agent log — `010_wf_decoder-swap/` | 2 |
| `working/` | 3 |
| a producer's artifact folder — `061_research-codecs/` | 4 |

---

# `summary.md`

Always present, and **the one file a reader opens first** — so it is the one file
allowed to be detailed. **Five `#` sections, in this order. Nothing else.** Four are
required; *Out of Scope* is optional.

```markdown
---
title: "Summary"
---

# State

> [!NOTE]
> Where the run is right now, and what happens next.

# Goal

# Todo

# Out of Scope

# Outcome
```

| Section | Holds | Shape | Changes |
|---|---|---|---|
| **State** | Where this run is right now and what happens next. Not a status token — that lives in `settings.json` | **A callout.** `> [!NOTE]` normally; `> [!WARNING]` / `> [!IMPORTANT]` when the run is stuck, reopened or failed | **Live** — the only section rewritten during the run |
| **Goal** | Purpose in plain language, context, expected outcome, **and the trigger** — who asked, when, in what words | Prose | Written once |
| **Todo** | The run's checklist, **headed by its references** — the plan stage and subtask this executes against, plus the scoping notes | **A linked list with a line of detail per item, or a table** | Ticked as work lands |
| **Out of Scope** | What this run deliberately does not touch. **Optional** — omit it rather than writing "nothing" | List | Written once |
| **Outcome** | What the run produced, what it cost, what it found, which gates it passed — with numbers | **A detail area**, as long as the run warrants | Written at close |

**State comes first** so opening the file tells you where things are without scrolling.
**It is a callout** because prose under a heading reads as introduction and gets
skimmed. The callout *type* carries meaning too: a reopened or blocked run says so with
`> [!WARNING]`, not only in the words.

## The Todo section — two rules that are really one

```markdown
- [x] `010` — the plans section                                     ← WRONG, twice
- [x] [The plans section](../../subtasks/040_execution/010_code-the-plans-section.md)
      — framework, CLI and validator; four new scaffolders           ← RIGHT
```

- **Every item is a LINK, never a bare number** — see
  [Linking](../10_writing/10_writing.md#linking). `agent-ks move` rewrites markdown
  links when files move; a backticked `` `010` `` is prose to every tool that exists.
- **Every item carries a line of what it actually did**, not just a title. A reader
  should not have to open ten subtasks to learn what the run accomplished. A checklist
  of titles is an index; a checklist with outcomes is a summary.

Use `[~]` for an item that shipped and then reopened, with the reason on the item.

**`summary.md` IS the brief.** Goal + Todo + Out of Scope already *are* the brief —
point a delegated agent at the file and spend the prompt on the delta. Standing rules
are referenced from `agent-memory/`, never re-typed. Never write a separate brief file.

**No notes section.** If it is worth writing, it goes in `debrief/`.

**`# Outcome` is detailed, and that is deliberate.** The rule it must obey is *point at
detail rather than copying it* — link the iteration file that holds the working, do not
re-narrate it. Length is not the constraint; restatement is. An earlier version of this
skill capped Outcome at one sentence, which aimed at restatement and hit the summary
instead: the file a reader opens first was the one forbidden to say anything.

**The Todo list is run-local and disposable.** An item that outlives the run becomes a
subtask.

---

# `working/`

## One iteration, one file — and an iteration is a GROUP

The atomic unit is an **iteration**, not an agent: a coherent round of work covering a
group of subtasks, executions and agents. The orchestrator writes the iteration file
from what the round produced.

**A file per agent is not created.** An agent that produced something substantial — an
audit, a research survey, a measured comparison — gets its own file, because that output
has to live somewhere and re-typing it is duplication. An agent that did a small piece
of work returns, and the orchestrator records the outcome in the iteration file.

> **File count scales with what was produced, not with how many agents ran.**

Concurrent producers each write their own file; the iteration file has exactly one
writer.

## Numbering — `NNN_<task-name>.md`

**First two digits = the iteration. Last digit = which file within it** — `0` for the
iteration file itself, `1`…`9` for a producer's own file.

```
working/
├── 010_audit-round.md              ← iteration 01 — the orchestrator's file
├── 011_scope-a-byte-surface.md     ←   producer: an audit report
├── 012_scope-b-blast-radius.md     ←   producer: an audit report
├── 020_fix-round.md                ← iteration 02 — no producer files needed
└── 030_battery.md                  ← iteration 03
```

**`working/` is FLAT.** The numbering already says "this iteration produced several
files". Add a folder only when a **single producer** makes several artifacts, and then
it is `NNN_<name>/` holding them.

If a round needs so many agents that a flat `working/` becomes unreadable, that is
evidence the **goal** should be two child agent logs — not that `working/` should grow a
tree.

## The iteration-file head

`agent-ks issue new-iteration` writes this for you. Four `#` sections; everything after
them is free-form.

```markdown
---
title: "Scope A — the byte surface"
status: done           # the canonical 7 — see below
agent: sol             # who wrote it
---

# Goal
The problem this agent was given, in one or two lines. Stands alone — a reader who
has opened nothing else understands what was being solved.

# Inputs
What to read first, as paths. `none` when there are none.

# Expected Outcome
What "done" looks like for this kind of work.

# Outcome
What actually came back.
```

**The orchestrator writes the head** — Goal, Inputs and Expected Outcome are the work
order, filled in when the file is created. On a producer file the producing agent writes
Outcome and below, so the file is the assignment *and* the result, and nothing has to be
restated in a prompt or a return value.

**`# Inputs` is what stops a review reading half a pair.** Without it, *"read 031–034
before writing the verdict"* lives only in a prompt, where it leaves no trace that it
was ever said.

### `status` means "did the agent finish" — not what it concluded

| Value | On an iteration file |
|---|---|
| `open` | created and assigned, not started |
| `in-progress` | running |
| `input-needed` | the agent stopped to ask; the question is in the body |
| `done` | the agent **finished its assignment** |
| `dropped` | the agent did **not** finish — crashed, refused, superseded |

**What the run found goes in `# Outcome`.** An audit that finished and found two real
defects is `status: done` — the agent did its job. An audit refused mid-flight is
`status: dropped`, with the reason in `# Outcome`.

**The status tints the prefix number** in the sidebar, wherever the file declares one.
That is the round-level signal: the agent-log folder's own dot says how the whole *run*
went, and a round inside it can have failed while the run finished. A file with no
`status` keeps the default number colour — untinted means *said nothing*, which has to
stay distinguishable from any status it might have declared.

### A dropped round carries TWO signals — both are required

```markdown
---
title: "One-pass probe"
status: dropped
---

# Outcome

> [!WARNING]
> **This round did not land.** The benchmark half was never run — the prototype
> settled the question before it was reached, so the numbers this round existed
> to produce do not exist.
```

| Signal | Job |
|---|---|
| `status: dropped` | **Scannable.** Tints the number; says the run did not deliver |
| The callout | **Readable.** Says *what* failed, and what it cost |

**Neither substitutes for the other, which is the whole point.** A bare `dropped`
compresses the only useful facts — what failed, what it cost, what was learned — into
one word that reads as if it already told you them. A callout with no status is
invisible until someone opens the file.

`agent-ks check issues` **warns on `status: dropped` with no callout.** It does not check
the reverse, because a callout on a round that succeeded is a caveat, which is fine.

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

State it even when it is obvious — it is the line that makes a half-finished file
legible as half-finished.

## What the body holds

**Thin but complete: essentials plus references.**

- What it did.
- The outcome in the broad sense, plus benchmark numbers if it produced any.
- **Issues found: one line each, plus a pointer.** Never the full write-up in place.

> An iteration file is complete because of what it points at, not because of what it
> repeats.

---

# `debrief/` — what leaves the run

```
debrief/
├── 01_handover.md          ← conventional landing file
├── 02_questions-for-sid.md
└── 03_findings.md
```

| Content | Example |
|---|---|
| **Handover** | what the next run must know to pick this up |
| **Questions for the user** | a decision the run could not take |
| **Findings and analysis** | what the run learned, including finished analysis files |
| **What is fixed and what is not** | the honest state of the change |
| **Lessons** | what failed and should not be retried |
| **Mid-run observations** | something noticed while working that matters later, but not now |
| **Caveats, dead ends, out-of-scope discoveries** | anything deliberately not done |

**Written during the run, not only at the end** — a mid-run observation goes in when it
is noticed.

`01_handover.md` is a convention, not a mandate. **No slot is required to exist.**

**Anything actionable leaves the log** and becomes a subtask or a dump entry; the
debrief keeps the pointer. A bug recorded only as log prose dies in the log.

**`debrief/` or the issue's `notes/`?** The test is audience:

| Question | Home |
|---|---|
| Does the next run of *this* work need it? | the agent log's `debrief/` |
| Does anyone touching *this issue* need it, ever? | the issue's `notes/` |

---

# Four cases stated explicitly

**An audit report is an iteration file.** One auditor, one file in `working/`, bound by
*thin but complete* like any other: findings with `file:line` and the reproduction, one
line each, detail pointed at rather than inlined. There is no separate `audit/` folder.

**A pair is two files, never one.** Two reviewers on one concern share the iteration
digits — `011_scope-a-reader.md` and `012_scope-a-executor.md`. Findings merge as a
**union, not a vote**: one half reproducing a crash is not outvoted by the other half
finding nothing, and that comparison needs both files.

**An external tool gets a named owner who writes its file.** Where one half cannot write
into the tracker itself — a separate CLI, a hosted model — a named agent owns the job,
waits for it to reach a terminal state, and writes the iteration file from the returned
result. `agent:` names the **tool**, because the finding is the tool's; the owner is
accountable for the file existing.

**Benchmarks split by weight.** The *numbers* go in the iteration file that produced
them. The *drivers, traces and raw dumps* go to the code repo's gitignored benchmark
directory — never the tracker.

# Where research, analysis and diagrams live

| Output | Home |
|---|---|
| One producer, several artifacts | `working/NNN_<name>/` — the folder form |
| A diagram supporting one iteration | `working/NNN_<name>.mmd` beside the iteration file |
| Analysis the run passes forward | the agent log's `debrief/` |
| Decision-bearing analysis another run will cite | the issue's `notes/` — the iteration file keeps a one-line pointer |
| An HTML dashboard or report | the issue's `notes/` — agent-log will not render it |
| Raw drivers, traces, dumps | the code repo's gitignored benchmark directory |

**The discriminator is audience, not size.**

`agent-log/` renders `.md` plus `.mmd` `.mermaid` `.dot` `.gv` `.excalidraw` as log
entries. `.html` artifacts render only in `notes/` and `brainstorm/`, so a run that
produces a dashboard graduates it to the issue's `notes/`.

---

# `settings.json` — status as data

Per agent log and per child agent log. Optional; absent renders grey.

```json
{ "status": "in-progress" }
```

- **Vocabulary:** the canonical seven **minus `blocked` and `review`**.
- **Not inherited.** Each folder's status is set independently — a child may be `done`
  inside a parent that is still `in-progress`.
- **Status only.** The kind is the two-letter code in the folder name, which draws the
  symbol; `settings.json` gives that symbol a colour.

**Two carriers, no overlap:** `settings.json` is per **folder**, frontmatter is per
**file**. Neither repeats what the folder name already says.

> `done` on an **agent log** means the run finished, and you may set it. `done` on a
> **subtask** is human-only and means the work is signed off. Same word, same
> vocabulary, opposite authority.

---

# The worked examples

Two, deliberately. One example alone sets a floor as much as a ceiling.

## The small end — a one-round change, two files

A subtask asked for one validator rule. One round, one executor, nothing produced but
the change itself.

```
agent-log/
└── 040_it_reject-empty-refs/
    ├── settings.json                   {"status": "done"}
    ├── summary.md
    └── working/
        └── 010_add-the-rule.md
```

`010_add-the-rule.md`, in full:

```markdown
---
title: "Add the rule"
status: done
agent: claude
---

# Goal
A plan stage referencing a subtask that no longer exists under-counts silently.

# Inputs
- `subtasks/030_validator/020_broken-refs.md`

# Expected Outcome
The change, and what it touched.

# Outcome
`check.mjs` errors on an unresolvable `subtasks:` ref; the plan page lists the broken
refs in red. Mutated the rule to confirm it fires: broken ref → 1 error, exit 1;
restored → exit 0.
```

**No `debrief/`** — nothing left the run. That is the correct shape, not an unfinished
one.

## The large end — a plan, an overnight loop, five workflows

The scenario: a plan with 8 stages, 4–5 subtasks each. An overnight loop covering stages
3–5. The loop runs 5 workflows. Each workflow has planning, execution, audit, review,
fix and benchmark units inside it.

**The mapping decision comes first, because it is the whole answer:**

- **The plan and its 8 stages do not appear in `agent-log/` at all.** A plan is a
  schedule — order and blocking. `agent-log/` is execution.
- **The overnight loop is one agent log** — one run, one starting state, one outcome.
- **Each workflow is a child agent log** — it has its own goal.
- **The workflow's stages are NOT folders.** They are the iteration digits.

```
data/tasks/2026-08-02-nsd-phase-2/
├── plans/
│   └── 020_decoder-and-retention/      # the 8 stages: order + what blocks what
├── subtasks/                           # the 4-5 per stage — filed by CATEGORY, not order
├── notes/                              # analysis that outlives the run
└── agent-log/
    └── 030_lp_overnight-stages-3-5/    # ── the loop: one run, one goal
        ├── settings.json               #    {"status": "done"}
        ├── summary.md                  #    State tells you where it got to
        ├── working/                    #    the LOOP's own files — 1 or 2, no more
        │   └── 010_round-ledger.md     #      which workflow ran when, why order changed
        ├── debrief/
        │   ├── 01_handover.md          #    what the next overnight run must know
        │   └── 02_questions-for-sid.md #    decisions the loop could not take
        │
        ├── 010_wf_s3-decoder-swap/     # ── workflow 1 (serves plan stage 3)
        │   ├── settings.json
        │   ├── summary.md              #    this IS the brief the agents were pointed at
        │   ├── working/                #    FLAT. first 2 digits = iteration, last = file
        │   │   ├── 010_plan-the-slice.md     # iteration 01
        │   │   ├── 020_execution.md          # iteration 02 — two executors ran; they
        │   │   │                             #   produced CODE, so no files of their own
        │   │   ├── 030_audit-round.md        # iteration 03 — concern + merged verdict
        │   │   ├── 031_audit-bytes.md        #   producer: the byte-surface report
        │   │   ├── 032_audit-blast.md        #   producer: the blast-radius report
        │   │   ├── 040_fix-round.md          # iteration 04 — what was fixed, what was not
        │   │   ├── 050_bench-before-after.md # iteration 05 — the numbers
        │   │   └── 060_research-codecs/      # one producer, several artifacts → a folder
        │   │       ├── 01_findings.md
        │   │       └── 02_decision-tree.mmd  #   mermaid renders as a log entry
        │   └── debrief/
        │       └── 01_handover.md
        │
        ├── 020_wf_s3-journal-compat/   # ── workflow 2, same shape
        ├── 030_wf_s4-retention/        # ── workflow 3 (stage 4)
        ├── 040_wf_s4-cleanup-accounting/
        └── 050_wf_s5-concurrency/      # ── workflow 5 (stage 5)
```

**The plan stage survives as a label, not a folder** — in the workflow's name (`s3`,
`s4`, `s5`) and in the loop's Todo. A folder would be a second place storing what
the plan already owns.

What this example teaches:

1. A schedule never becomes a folder tree.
2. Iterations are digits, not directories.
3. A file exists because something was **produced**, not because an agent ran. Two
   executors writing code produce one iteration file between them; two auditors writing
   reports produce two, plus the iteration's own.
4. One producer making several artifacts is the only reason to nest inside `working/`.
5. Depth stops at four.

---

# Recipes

## Open an agent log

```bash
agent-ks issue new-agent-log --issue <id> --kind wf --name ship-the-decoder
```

Creates the folder with `settings.json` and `summary.md`. `working/` and `debrief/`
appear when there is something to put in them — git does not track an empty directory,
so a scaffolded empty folder exists only for whoever ran the command.

## Open the next iteration file

```bash
agent-ks issue new-iteration --issue <id> --log 030_lp_overnight --name audit-round
agent-ks issue new-iteration --issue <id> --log 030_lp_overnight --name audit-bytes --producer
```

Derives the number — `--producer` attaches to the current iteration (`031`), otherwise
it opens the next one (`040`) — and writes the head. Fill in Goal, Inputs and Expected
Outcome **before** the work starts; that is what makes the file a work order rather than
a report.

## Append to a file already open

`agent-ks issue add-agent-log` appends and writes valid frontmatter, but flattens a
multi-line body into one paragraph. Use it for a genuine one-liner; write anything
longer directly to the file.

## Rapid ad-hoc changes

Landing several small changes in a burst: group them against the block they belong to.
If they carry reasoning worth keeping, that is one agent log of kind `it` with one
iteration file — not one folder per change.

# Boundaries

- **Never rewrite history.** Iteration files are write-once by nature; `# State` in
  `summary.md` is the only live text in an agent log.
- **`agent-memory/` is not part of `agent-log/`.** The log records what happened; memory
  holds what is still true ([26_agent-memory.md](26_agent-memory.md)).
- **The run's task list is not the subtask list.** Subtasks are durable and counted; the
  task list in `summary.md` is disposable.
