---
title: "Verdict — reader 3 (gpt-5.6-sol)"
status: done
agent: gpt-5.6-sol
---

# Goal

The same four questions as [reader 1](./071_verdict-opus.md) and
[reader 2](./072_verdict-sonnet.md), same brief, same two folders. A different
model family, so a shared blind spot is less likely.

# Inputs

The brief verbatim, plus `VERSION-A-old/` and `VERSION-B-new/`. Job
`task-msc5che5-6fd67f`, `--background --fresh --model gpt-5.6-sol --effort
xhigh`, run from inside `/home/sid/projects` so the trusted-root check passed.

# Expected Outcome

A verdict in the brief's shape, including the worst passage in its own winner.

# Outcome

**B on all four questions**, with the sharpest summary of the trade any reader
gave: B's contradictions are *"severe but localized"* while A's overlapping
ownership is *"pervasive"*.

It contributes three defects neither other reader found, all of them countable
rather than arguable:

- **`03_overall-issue-tracker-vocabulary.md:57-64` — a section titled "Three
  vocabulary layers" that lists four.**
- **`63_agent-loops.md:81-85` — "a two-round bugfix does not need an agent log",
  immediately after the rule that multi-round work opens one.** The example
  contradicts the rule it sits beside, in the same file.
- **`28_plans.md` — "a plan stores no status of its own about the work" against a
  stage schema that requires `status` and agents told to update it as work
  lands.** It asks the question neither other reader reached: what is a stage's
  status when its referenced subtasks disagree? The document never says.

This third one is the most interesting finding in the audit, because it is
aimed at the plans section's central claim rather than at a stale leftover. The
distinction it does not draw — a stage's *own* lifecycle versus a summary of the
work inside it — is drawn explicitly in the user-guide page
(`19_issues/05_sub-docs/09_plans.md`) and not in the skill. **That is a real gap,
and it is exactly the kind this issue exists to close.**

It also independently found A's `002_task-list.md` cross-reference, which
reader 1 found too — a filename that cannot exist under A's own scheme.

One defect it reports in **both** versions, so not a regression: `10_writing.md`
requires `title` on every markdown file and says builds fail without it, then
exempts comments, while both notes pages call `title` optional.

**Not acted on**, per subtask 130. Everything below is the reader's text.

---

## Verdict

| Question | Winner | One-line reason |
|---|---|---|
| 1 reads better | B | Its boundary tables put the answer near the top, so extra length rarely becomes extra reading. |
| 2 more coherent | B | It gives order, scope, execution, memory, and conclusions distinct homes; A repeatedly overlaps them. |
| 3 more structured | B | "Holds / Does not hold" tables and explicit boundary tests route by question, not merely by filename. |
| 4 rather follow | B | Its separate plans and leaner memory model make real work easier to place and resume. |

**Overall:** B, because its ownership model is substantially easier to navigate
and operate despite several serious local contradictions.

## Why — per question

**1 — Reads better: B.** B states one routing rule — "No file stores a fact
another file owns" — then immediately maps every section and the commonly
crossed boundaries (`VERSION-B-new/SKILL.md:50–86`). Its section pages repeat
that compact pattern; for example, the notes decision can usually be made from
`references/20_sections/22_notes.md:7–19`. A is shorter overall, but its most
important execution rules arrive as long, qualification-heavy bullets
(`VERSION-A-old/SKILL.md:149–211`). B's 491-line agent-log reference is the
notable exception.

**2 — More coherent: B.** B consistently separates conclusions, order, scope,
execution, and memory (`VERSION-B-new/SKILL.md:57–77`;
`references/20_sections/26_agent-memory.md:8–42`). A calls subtasks "the plan"
while also creating live plans under `agent-memory/`, and lets memory
`knowledge/` hold decisions even though notes already own settled decisions
(`VERSION-A-old/SKILL.md:50–62,203–208`;
`references/20_sections/26_agent-memory.md:14–37`;
`references/20_sections/22_notes.md:3–15`). A also says all six agent-log slots
remain present, then says files beyond `00_goal.md` are add-as-needed
(`references/20_sections/24_agent-logs.md:31–52,155–160`). B is not
contradiction-free: its plan page says plans store no work status but specifies
stage status, and its child-log rule conflicts with its worked example. Those
are severe but localized; A's overlapping ownership is pervasive.

**3 — More structured: B.** B supplies a routing test, four high-risk
boundaries, and a task-to-reference index
(`VERSION-B-new/SKILL.md:69–86,296–316`). Each major section opens by excluding
neighboring content — for example, subtasks distinguish scope from order and
execution before explaining file mechanics
(`references/20_sections/23_subtasks.md:7–38`). That lets a reader stop early. A
has a good reference index, but frequently requires reading deep enough to
reconcile rules, templates, and examples.

**4 — Rather follow: B.** The dedicated `plans/` contract gives ordering and
blocking a first-class home while subtasks retain executable scope
(`VERSION-B-new/references/20_sections/28_plans.md:1–23`). Its memory section
then becomes a small index plus truth/history buckets
(`references/20_sections/26_agent-memory.md:15–42`). Under A, I would resent
maintaining both durable "plan" subtasks and agent-memory plans, as well as six
agent-log slots that must exist even when blank
(`VERSION-A-old/references/20_sections/24_agent-logs.md:31–52`).

## The worst passage in my winner

`VERSION-B-new/references/20_sections/24_agent-logs.md:69–70`:

> "A ten-stage plan gives ten child agent logs; a loop with four named goals
> gives four; the agents running inside any of them give iteration files."

This dictates the wrong organizing principle twice. The same page later says
plan stages "do not appear in `agent-log/` at all" and that workflows with their
own goals become child logs (`:378–390`). It also defines an iteration as a
group rather than one agent and says file count follows produced output, not
agent count (`:118–132`). An agent cannot safely build the folder tree from this
passage.

## What my winner does worse

B handles status vocabulary worse. It intentionally makes `done` human-only for
issues/subtasks but agent-set for logs — "Same word, opposite authority"
(`VERSION-B-new/SKILL.md:167–180`;
`references/20_sections/24_agent-logs.md:327–329`). A's distinct milestone
vocabulary, `success | failed`, avoids that trap
(`VERSION-A-old/references/20_sections/24_agent-logs.md:71–77`).

B also makes agent-log work harder to learn: "iteration," "producer file," child
log, reserved folders, digit allocation, and two status carriers all have to be
understood before writing
(`VERSION-B-new/references/20_sections/24_agent-logs.md:31–84,134–154,310–325`).
A's milestone model is simpler.

## Instructions I could not follow

- B says a plan stores no status about work and needs no synchronization rule,
  but its stage schema requires `status`, its next section defines that status,
  and agents are told to update it "as work lands"
  (`VERSION-B-new/references/20_sections/28_plans.md:7–16,64–70,100–105,147–152`).
  It never states how a stage status is derived when its referenced subtasks
  disagree.

- B's claimed single-subtask exception — "there is only one place and no
  duplication to avoid" — does not identify that place, although both the
  subtask and agent log still exist
  (`VERSION-B-new/references/20_sections/23_subtasks.md:14–18`).

- A says plans are updated in place and never deleted, with closed plans frozen,
  but later orders superseded plans moved out of `plans/` into `history/`
  (`VERSION-A-old/references/20_sections/26_agent-memory.md:70–78,224–235`).
  Those instructions cannot both govern a superseded closed plan.

## Flatly wrong

- In both versions, `references/10_writing/10_writing.md:14–24` says `title` is
  required on every Markdown file and builds fail without it, then exempts
  comments. Both notes pages also call `title` optional when adding a note
  (`VERSION-A-old/references/20_sections/22_notes.md:52–60`;
  `VERSION-B-new/references/20_sections/22_notes.md:64–71`). At least one rule is
  false.

- A names a loop file `002_task-list.md`
  (`VERSION-A-old/references/20_sections/23_subtasks.md:187–189`), while its
  defined filename everywhere else is `02_task_list.md`.

- B's "Three vocabulary layers" section enumerates four
  (`VERSION-B-new/references/00_anatomy/03_overall-issue-tracker-vocabulary.md:57–64`).

- B says a two-round bugfix does not need an agent log, immediately followed by
  the absolute rule that work running over multiple rounds opens one
  (`VERSION-B-new/references/60_examples/63_agent-loops.md:81–85`).

- B's child-log passage quoted above is contradicted by its own large worked
  example, and its "plan stores no status" claim is contradicted by its own stage
  schema.
