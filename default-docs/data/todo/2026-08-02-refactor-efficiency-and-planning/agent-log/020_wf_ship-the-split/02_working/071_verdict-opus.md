---
title: "Verdict — reader 1 (Opus)"
status: done
agent: opus
---

# Goal

Answer the four questions in the shared brief on the old and new
`agent-ks-issues` skill, with a winner and a reason for each, having seen
neither this issue nor the reasoning behind either version.

# Inputs

The brief verbatim, plus `VERSION-A-old/` and `VERSION-B-new/` in a scratch
directory with nothing else in it. No repo, no history, no other docs.

# Expected Outcome

A verdict in the brief's shape, including the worst passage in its own winner.

# Outcome

**B, on all four questions.** The reasoning is not "B is newer" — the reader
explicitly declined that — it is that A overloads the word *plan* across three
referents and B has one. **It also found five defects that are genuinely wrong
rather than merely arguable**, listed under *Flatly wrong* below. Four of them
are in B.

The one that matters most: **`00_overview.md` and `SKILL.md` disagree about who
may set `done` on an agent log.** Both state it as a rule and neither defers to
the other, so an agent loading only the overview will refuse to close its own
log. That is the exact ceremony this issue set out to delete, surviving in the
file whose heading calls itself *the most important rules in the whole skill*.
It is also, precisely, the duplicated fact that went stale — which is what the
new skill's own headline rule predicts.

**Not acted on**, per subtask 130. Everything below is the reader's text.

---

## Verdict

| Question | Winner | One-line reason |
|---|---|---|
| 1 reads better | **B** | Every section page opens with a `Holds / Does not hold` table, so the answer to "does this go here?" is two rows, not a paragraph |
| 2 more coherent | **B** | A uses "plan" for three different things and never notices; B's incoherences are stale leftovers in three findable files |
| 3 more structured | **B** | A files its entire plan/ordering system inside `26_agent-memory.md`, which the index advertises as "index + topics"; B gives it its own file |
| 4 rather follow | **B** | A imposes a six-stub-file floor on every run; B opens an agent log only when work is delegated or spans rounds, with two required files |

**Overall:** B — it names one rule ("no file stores a fact another file owns"),
then actually partitions the vocabulary that A leaves overloaded; A's brevity is
partly the brevity of an unresolved model.

## Why — per question

**1 — reads better.** The comparison is clearest on the same content. A's
`22_notes.md:3-15` is one 13-line sentence-chain ("Content arrives by
**graduating** out of a resolved brainstorm …, fully formed …, or **out of an
executing run** — research, evidence, rationale, or a plan/contract produced
inside a workflow or loop that a decision or downstream work rests on …"). B
replaces the same material with a four-row table plus `22_notes.md:14` "**The
test:** would a future reader need it to answer *"why did we do it this
way?"*". Mid-task I need the boundary, not the derivation. Same pattern at
`23_subtasks.md:7-15`, `21_comments.md:7-11`, `25_brainstorm.md:7-13`,
`24_agent-logs.md:11-19`, `26_agent-memory.md:8-14` — six pages, one consistent
lookup shape. B's `24_agent-logs.md` is 491 lines against A's 341, and it is
still the faster read: the folder diagram is at line 43, the only nesting rule
is a two-line blockquote at 65-68, and the numbering rule is one sentence at
136. A's equivalent answers are spread across a slot table (30-52), a mapping
table (143-150), a reference tree (162-191) and a rhythm list (207-226). Length
went up; distance-to-answer went down.

**2 — more coherent.** A's decisive failure is a word, not a paragraph. "Plan"
means the subtask list (`23_subtasks.md:189` "`subtasks/` is the issue's durable
**plan / decomposition**"; `24_agent-logs.md:324`; `63_agent-loops.md:64`), *and*
the `agent-memory/plans/NNN_plan-*.md` files that are the whole subject of
`26_agent-memory.md`, *and* "the plans or contracts downstream work executes
against", which `24_agent-logs.md:255` routes to `notes/`. Three referents, no
cross-reference between them, and the collision is load-bearing: A's plan
template (`26_agent-memory.md:130-131`) holds a checkbox copy of the subtasks
with a `Subtasks` done/total column "derived from the boxes below — the linter
compares them" (line 208), while line 218 of the same file says "restating a
subtask's contents guarantees drift." A tells you to maintain the copy it warns
you about. B has one referent for "plan", states the boundary in four files
identically, and removes the copy (`28_plans.md:14` "A plan stores no status of
its own about the work, so it cannot drift from reality — there is no reality
stored in it"). "Iteration" is the same story: in A it is a frontmatter badge, a
loop round, the `it` kind, and an agent-log entry (`61_multiple-subtasks.md:31`
"prior iterations"); B opens `24_agent-logs.md:31-40` with a five-row vocabulary
table and renames the example's rounds. B's own contradictions are real but
different in kind — three files it forgot to update (detailed below), each of
which its own headline rule predicts.

Contradictions I actually found, by version:

| Version | Contradiction |
|---|---|
| A | `23_subtasks.md:20` "nested up to 5 levels deep" vs `23_subtasks.md:157` "`NN_<group>/NN_<subgroup>/NN_<slug>.md` (deepest the loader accepts)" and `01_folder-layout.md` "level-2 leaf (deepest accepted)" — 3 or 5, stated as fact both ways |
| A | `26_agent-memory.md:92` says the CLI enforces one-open-at-a-time on a `plan: open\|closed` frontmatter field; `26_agent-memory.md:257` says it "refuses if the current highest plan has no `## Closed` section". Two mechanisms, one rule |
| A | `63_agent-loops.md:20` uses `03_attention-needed.md`, occupying the `03_working` slot that `24_agent-logs.md:32-45` reserves and requires "present even when blank" — and the same activity has no `04`/`05` |
| B | `00_anatomy/00_overview.md:72,83` vs `SKILL.md:179-180`, `24_agent-logs.md:328`, `28_plans.md:131` — see "worst passage" |
| B | `61_multiple-subtasks.md:43,57` still teaches "append an agent-log entry summarising Goal / Approach / Result / Next" and "A flat `agent-log/` is fine here" — B abolished both (its head is `# Goal / # Inputs / # Expected Outcome / # Outcome`, and `24_agent-logs.md:24-29` says an agent log opens only for delegated or multi-round work) |
| B | `24_agent-logs.md:486` "Iteration files are write-once by nature; `# State` in `summary.md` is the only live text" vs `24_agent-logs.md:95,97` (Task List "Ticked as work lands", Outcome Summary "Written at close") and `24_agent-logs.md:182` (orchestrator writes the head, producer writes Outcome later) |
| B | `23_subtasks.md:36` "group by **area**, one level" vs `23_subtasks.md:62` "nested up to 5 levels deep … Keep to 3 levels or fewer" |
| Both | Index-leaf status: `23_subtasks.md` says an agent may flip an index leaf to `done` ("mechanical bookkeeping, not a hand-off"), while the AI rule in the same file says `done` is human-only on a subtask — and the index leaf "is a regular subtask **file**" |
| Both | `62_research-focused.md:31` "**`comments/` is load-bearing** — the back-and-forth that converges on the decision … belongs here as the durable thread" vs the comments tripwire in `21_comments.md`. B made this worse by tightening `comments/` to "Does not hold: the **debate**" and leaving the example untouched |

**3 — more structured.** Test: I need to know how work gets ordered and what
runs next. In A, that is `26_agent-memory.md` — 267 lines of which roughly 160
are a plan-file template, a "cycle" definition, an identity-vs-order rule, an
optional `## Execution order` table and a columns reference — reachable only
from a triage row reading "Agent-memory: index + topics" (`SKILL.md:230`).
Nothing in A's index says ordering lives there. In B it is `28_plans.md`, named
"Plans: stages, references, the active plan" in the index, and
`26_agent-memory.md` shrinks to 90 lines that state outright what it no longer
holds (`26:38` "There is no live bucket, and nothing replaces it"). Second test:
what does *not* belong in a file I am about to write? A answers only in prose,
if at all; B answers in the right-hand column of every section header table.
That column is the structural difference, and it is the one that maps to what an
agent actually does wrong.

**4 — rather follow.** Cost per unit of work. A's `24_agent-logs.md:44-46`: the
six standard slots are "kept present even when blank — a stub with `title`
frontmatter and a short callout stating what the slot is for … A not-applicable
slot keeps the stub but says so." That is six files before any work, for every
activity, plus a mandatory `01_summary.md` and full frontmatter on every
milestone. B's floor is `settings.json` + `summary.md`, with "`working/` and
`debrief/` appear when there is something to put in them" (`24:456`), "**No slot
is required to exist**" (`24:256`), and `SKILL.md:119` "**No record for small
work.** A one-line change earns neither a subtask nor an agent log." B also
removes A's second status vocabulary — A runs `not-started | in-progress |
success | failed` on milestones alongside the seven everywhere else, with
`24:77` warning "`done` on a milestone is wrong", which is a trap A had to
install because it created it. What would annoy me about A, concretely: writing
four blank stub files with fill-me callouts for a two-round fix, then
maintaining a checkbox mirror of the subtask list inside a plan file that warns
me the mirror drifts.

## The worst passage in my winner

`VERSION-B-new/references/00_anatomy/00_overview.md:72-86`, the file whose own
heading is "AI rules — the most important rules in the whole skill":

> **Agent logs and iteration files use five of the seven** — `blocked` and
> `review` mean nothing for a run. There, `done` means the agent finished its
> assignment and `dropped` means it did not…
>
> 1. **Manage `in-progress`; hand off at Review; never mark `done`/`dropped`.**
>    … `done`/`dropped` are *human-only*.

Nine lines apart, in the same section, plus the status table at line 72
asserting "Terminal; both **human-only**" without qualification. Meanwhile
`SKILL.md:179` says "**`done` on an agent log is yours to set.** Same word,
opposite authority", `24_agent-logs.md:328` repeats it, and `28_plans.md:131`
says "**You may close a plan**". B's whole thesis is "no file stores a fact
another file owns" — and the one duplicated fact it kept, the AI-rules block
copied into both `SKILL.md` and `00_overview.md`, is exactly the one that went
stale. If I load `00_overview.md` and not `SKILL.md`, I will refuse to close my
own agent log and hand it to the user, which is precisely the ceremony B set out
to delete.

## What my winner does worse

1. **It dropped the concrete sizing guidance.** A's `24_agent-logs.md:143-150`
   answers "how many files should this run produce?" per kind — a workflow
   phase, a loop iteration, an audit's sweep/findings/fixes, a refactor's
   structural move. B replaces it with a principle ("an iteration is a GROUP",
   "own goal → child agent log") and one table of expected outcomes per work
   unit. The principle is better; the loss is that a first-time reader of B has
   no calibration for where a round ends, and B's own answer to over-nesting is
   a judgment call ("If a round needs so many agents that a flat `working/`
   becomes unreadable, that is evidence the **goal** should be two child agent
   logs").
2. **It pushes toward less detail in the log while keeping "read the log before
   starting work".** A's "Detail bar — reconstructable without the transcript"
   (`24:294-302`) is deleted; B's replacement is "**Thin but complete:
   essentials plus references**" and a one-sentence Outcome Summary rule
   (`24:108`). For resumability that is a step backwards, and B does not say
   what happens when the pointers point at a repo that has moved on.
3. **It orphans existing flat logs.** A documents `agent-log/NNN_<name>.md` as
   still parsing for backward compatibility (`24:9-11`). B removes the mention
   while its own `61_multiple-subtasks.md:57` still recommends it — so an agent
   opening an old issue full of flat logs finds no rule in B at all.
4. **The examples were not migrated.** `61`, `62`, `64`, `41_searching.md` and
   `42_updating.md` are byte-identical to A. In A they were consistent with A's
   model; in B, `61` and `41` are now wrong (see below). Three of B's four
   worked examples predate the model they illustrate.

## Instructions I could not follow

- **B — who sets `done` on an agent log.** `00_overview.md` says never;
  `SKILL.md`, `24_agent-logs.md` and `28_plans.md` say yes. Both are stated as
  rules, neither defers to the other. I cannot pick without guessing.
- **B — `24_agent-logs.md:486` "Iteration files are write-once by nature"**, when
  `24:182` instructs the orchestrator to write Goal/Inputs/Expected Outcome
  before the work and the producer to write `# Outcome` after it. Either the file
  is written twice or the head is written after the fact; the recipe at `24:469`
  says the opposite ("Fill in Goal, Inputs and Expected Outcome **before** the
  work starts").
- **B — the nesting ceiling.** `24:75-84` says "Two levels of child agent log is
  the working ceiling" and then shows a table containing exactly one; the worked
  example concludes "Depth stops at four" (`24:444`). I cannot tell whether a
  second nested child log is legal.
- **B — `23_subtasks.md`, how deep may a group go.** "one level" (line 36), "3
  levels or fewer" (line 62), "up to 5 levels deep" (line 62). Three numbers in
  one file.
- **A — `26_agent-memory.md`, how to close a plan** so `new-memory-plan` will
  open the next one: set `plan: closed` in frontmatter (line 92) or add a
  `## Closed` section (line 257)? The rule is described as structurally
  enforced, so guessing wrong blocks the command.
- **A — `23_subtasks.md`, how deep may a subtask nest.** Line 20 says 5, line 157
  says 2 group levels is "deepest the loader accepts".
- **Both — flipping a series index leaf to `done`.** Permitted as bookkeeping and
  forbidden as a human-only transition, in the same file, about the same file
  type.

## Flatly wrong

- **B, `24_agent-logs.md:420` — the flagship example violates B's own numbering
  rule.** The rule at line 136: "First two digits = the iteration. Last digit =
  which file within it — `0` for the iteration file itself, `1`…`9` for a
  producer's own file." The example then shows `060_research-codecs/` annotated
  "one producer, several artifacts → a folder" — a producer occupying the `0`
  slot reserved for the iteration file, in an iteration that has no iteration
  file. The same artifact is correctly numbered `061_research-codecs/` in the
  depth table at line 83 of the same document.
- **B, `41_searching.md:46` — describes a dropped field.** "`agent-ks issue
  add-agent-log` … Append an agent-log entry with auto-incremented
  **iteration**." B removed `iteration` frontmatter entirely; `24:472` describes
  the same command as appending to an open file. The same page's "8
  issue-tracker CLI wrappers" list omits `new-iteration`, `new-plan`,
  `new-stage` and `new-agent-log`, which `SKILL.md:323-331` documents as
  existing. (The count is stale in A too, but A's `iteration` field is real.)
- **B — inconsistent CLI argument grammar.** `23_subtasks.md:117` `agent-ks issue
  new-subtask <id> --name <slug>` (positional) against `24:453` `agent-ks issue
  new-agent-log --issue <id>` and `28:168` `new-plan --issue <id>`. A is
  uniformly positional; B introduced `--issue` for the new commands only and
  never says which form is canonical.
- **B — plan folder prefix width.** `28_plans.md` and `01_folder-layout.md`
  specify `plans/NN_<name>/` and every recipe uses `01_decoder-and-retention`;
  `24_agent-logs.md:395` shows `plans/020_decoder-and-retention/`.
- **A, `23_subtasks.md:189` — a cross-reference to a file that cannot exist.** "A
  loop's `002_task-list.md` inside `agent-log/`". Under A's own scheme the file
  is `02_task_list.md` (a pinned `0NN` slot, underscores); `002_` would parse as
  a milestone-adjacent 3-digit prefix and `task-list` is the wrong separator.
  `24:324` gets it right, which is how you can tell.
- **A, `01_folder-layout.md` — "level-2 leaf (deepest accepted)"** stated in the
  canonical folder tree, contradicting the 5-level cap the same document's
  header announces. B silently fixed this one.
