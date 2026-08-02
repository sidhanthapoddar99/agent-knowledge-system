---
title: "Verdict — reader 2 (Sonnet)"
status: done
agent: sonnet
---

# Goal

The same four questions as [reader 1](./071_verdict-opus.md), same brief, same
two folders, no sight of the other readers.

# Inputs

The brief verbatim, plus `VERSION-A-old/` and `VERSION-B-new/` in a scratch
directory with nothing else in it.

# Expected Outcome

A verdict in the brief's shape, including the worst passage in its own winner.

# Outcome

**Split: B on questions 1 and 3, A on questions 2 and 4, and A overall.** The
first genuine disagreement between readers, and it is not a soft one — this
reader calls B's information architecture "genuinely better factored" and still
would rather follow A.

The reason it gives is the one thing both readers found independently: **the
worked examples were never migrated to the model they illustrate.** Reader 1
listed it fourth under *What my winner does worse*; this reader made it the
deciding factor. Two specific files, named by both:

- `64_phase-index.md:31` — "Numbering encodes sequence" — contradicts the new
  rule that a subtask number is an id and a sort key, never order.
- `61_multiple-subtasks.md:43,57` — teaches the retired
  `Goal / Approach / Result / Next` shape and a "flat `agent-log/`" fallback
  that the new model does not define.

**Two readers converging on the same defect from opposite verdicts is the
strongest signal in this audit.** Reader 1 reached it by auditing the new
version against its own rules; this one reached it by asking which version it
would rather work under. Neither was told to look at the examples.

It also flags one defect **present identically in both versions**, which is
therefore not a regression and not something this issue introduced:
`43_moving-restructuring.md` calls `agent-log/` append-only, while each
version's own agent-log document names a section that is rewritten in place.

**Not acted on**, per subtask 130. Everything below is the reader's text.

---

## Verdict

| Question | Winner | One-line reason |
|---|---|---|
| 1 reads better | B | every section file opens with a Holds / Does-not-hold table, a scannable answer before any prose |
| 2 more coherent | A | B's own worked examples contradict B's own new rules — twice, concretely |
| 3 more structured | B | one ownership table plus a dedicated `plans/` file cleanly separates "order" from "scope," which A conflates |
| 4 rather follow | A | fewer numbering rules to get right, and — unlike B — its worked examples never mislead you |

**Overall: A.** B's information architecture is genuinely better factored, but
the refactor was not carried through to its own examples, so following B carries
a real risk of copying a stale pattern that contradicts B's own current rules —
under the "mid-task, need one answer, get back to work" reading this brief
describes, that risk outweighs B's structural gains.

## Why — per question

**1 — reads better (B).** Every `20_sections/` file in B opens with a two-column
`Holds | Does not hold` table (`references/20_sections/24_agent-logs.md:11-19`,
`23_subtasks.md:7-15`, `22_notes.md:7-12`, `28_plans.md:7-12`). Once you've seen
the pattern twice you can answer "does X belong here" by scanning one table
instead of parsing paragraphs — exactly what a reader mid-task wants. A has no
equivalent; its section files open with descriptive prose you have to read in
full to extract the same boundary.

**2 — more coherent (A).** Two concrete contradictions in B, both from a
restructuring that wasn't carried through to its own worked examples:

- `references/60_examples/64_phase-index.md:31` says *"Numbering encodes
  sequence. The subtask prefixes (`00_`, `01_`, … `16_`) are a real ordering —
  the order the phase intends to tackle steps — not just sort sugar."* This
  directly contradicts B's own new rule two files over:
  `references/20_sections/23_subtasks.md:20-22` — *"A subtask's number is a
  stable id and a sort key within its category. It does not imply sequence"* —
  and its stated failure mode at `23_subtasks.md:40-44`, which describes almost
  exactly what 64 does ("a group whose overview says 'reading order is execution
  order'... that chain is a plan").
- `references/60_examples/61_multiple-subtasks.md:43-44` instructs: *"append an
  agent-log entry summarising Goal / Approach / Result / Next"* and line 57
  refers to *"a flat `agent-log/`"* as a fallback. Neither exists in B's actual
  model: the real agent-log entry shape (`24_agent-logs.md:161-180`) uses
  `# Goal / # Inputs / # Expected Outcome / # Outcome`, and no "flat agent-log"
  fallback is described anywhere in B's `24_agent-logs.md` or
  `01_folder-layout.md` (A documents this exception explicitly; B dropped the
  mechanism but not the reference to it).

I found nothing of comparable severity in A — every cross-reference I checked in
A resolved to matching content.

**3 — more structured (B).** `SKILL.md:50-71` states the rule directly — *"No
file stores a fact another file owns"* — backed by a section-ownership table and
a "four boundaries that get crossed most" table naming exactly the seams that
get confused (`subtasks/` vs `agent-log/`, `plans/` vs `subtasks/`, etc.). A
splits "order" nowhere cleanly: it either rides on subtask numbers (as
`64_phase-index.md` shows) or gets buried inside agent-owned
`agent-memory/plans/` (A's `26_agent-memory.md`, a 267-line "cycle"
sub-language). B gives order its own file (`28_plans.md`), so a reader with an
ordering question goes to exactly one place.

**4 — rather follow (A).** B's `working/` numbering scheme
(`24_agent-logs.md:134-146`) encodes meaning in digit *position* — "first two
digits = the iteration, last digit = which file within it" — with no stated lint
or validator to catch a mis-numbered file. A's equivalent
(`24_agent-logs.md:73-77` in A) is a flatter scheme where a missing `iteration:`
frontmatter field is explicitly validator-checked ("the validator warns"). More
decisively: following B's own worked example 61 verbatim produces an agent-log
entry that violates B's own current rules (see Q2) — a document that misleads
its own reader on the exact task ("log this round of work") it exists to answer
is one I would trust less doing real work, even though A's model asks less of me
to begin with.

## The worst passage in my winner

`VERSION-A-old/references/20_sections/26_agent-memory.md:220-222`:

> *"3. **Trace every identifier to its defining table before acting on it.**
> Downstream summaries are not sources, and identifiers collide (two queues both
> numbering `MV-1`)."*

"Two queues both numbering `MV-1`" is dropped in with zero explanation of what a
queue is in this context, what `MV-1` refers to, or where the collision was
observed. Every other sentence in both documents is self-contained; this one
reads as a leaked fragment from a real incident that a neutral reader — exactly
the position this brief puts me in — cannot parse at all.

## What my winner does worse

- **No first-class order/schedule section.** A has nothing equivalent to B's
  `plans/` — a multi-week effort's ordering either gets encoded as implicit
  subtask-number sequence (`64_phase-index.md`, which even the review calls "not
  just sort sugar") or buried inside agent-owned `agent-memory/plans/`. B's
  separation is a real capability A lacks.
- **No scan-table pattern in section files.** Every section in A requires reading
  prose to extract "does this belong here" — genuinely slower than B's `Holds /
  Does not hold` tables (see Q1/Q3 above).
- **`agent-memory/` is overloaded.** A's `26_agent-memory.md` (267 lines) stuffs a
  whole scheduling sub-language (cycles, execution-order tables, `Depends on`
  columns) into what is supposed to be lightweight AI scratch memory. B
  correctly relocates that responsibility to the issue level and slims the
  equivalent file to 90 lines — a cleaner design A does not have.

## Instructions I could not follow

None that were simply ambiguous or circular in either version. The closest case
is already covered under "flatly wrong" below: B's `61_multiple-subtasks.md`
instruction to log *"Goal / Approach / Result / Next"* cannot be followed *and*
stay consistent with B's own current agent-log rules — following it produces a
file shape B's validator-adjacent description (`24_agent-logs.md`) does not
recognize.

## Flatly wrong

- **B, `references/60_examples/64_phase-index.md:31`** — "Numbering encodes
  sequence" contradicts B's own stated rule in
  `references/20_sections/23_subtasks.md:20-44` and `SKILL.md:57-71` that a
  subtask number is never order.
- **B, `references/60_examples/61_multiple-subtasks.md:43-44,57`** — instructs a
  "Goal / Approach / Result / Next" milestone entry and references a "flat
  `agent-log/`" fallback, neither of which exists in B's actual agent-log model
  (`24_agent-logs.md`, `10_writing.md`'s frontmatter table).
- **Minor, present unchanged in both A and B** —
  `references/40_operations/43_moving-restructuring.md` states flatly that
  `agent-log/` is append-only, while each version's own agent-log doc names one
  explicitly live, rewritten-in-place section (A: `02_task_list.md`, "update as
  you go"; B: `# State` in `summary.md`, "the only section rewritten during the
  run"). Worth flagging since it is technically wrong in both, identically.
