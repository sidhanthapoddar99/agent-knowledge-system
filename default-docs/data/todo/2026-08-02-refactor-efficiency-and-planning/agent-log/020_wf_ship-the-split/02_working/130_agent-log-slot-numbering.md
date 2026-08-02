---
title: "Numbering the agent log's own slots"
status: done
agent: claude
---

# Goal

Give an activity's three slots numeric prefixes — `01_summary.md`,
`02_working/`, `03_debrief/` — and make "slot or child activity?" a question
about a number rather than a hard-coded list of names.

# Inputs

- Sid, 2026-08-03: *"agent log — summary → 01 summary, working → 02 working,
  debrief → 03 debrief. subsequent nested agent logs NXX where N>=1 thats it."*
  Then: *"if possible in the convention change in the docs, the demo issue, the
  skill"*, and *"maybe start 3 background subagent for this"*.
- The spec written before any work started, which was also the agents' brief:
  [the numbering spec](../../../notes/80_agent-log-numbering-spec.md)
- Blast radius measured first: 4 framework files, 5 CLI scripts, 14 folders to
  rename, **114 markdown lines mentioning `summary.md`**

# Expected Outcome

The convention live in code, CLI, guide, skill, docs and fixtures; a migration
script for consumer trackers; and a control run proving the migration does the
five things it should and leaves alone the two it should not.

# Outcome

## How the work was split, and the one rule that shaped the split

Three background agents ran in parallel on **prose only** — user-guide +
dev-docs, the skill markdown, and this issue's own notes + subtasks. Framework
code, every CLI script, the in-app guide, the migration, and **every file
rename** stayed with the orchestrator.

**The renames could not be delegated, and could not even run concurrently with
the agents.** `agent-ks move` is link-aware: it rewrites references across the
whole content root on every invocation. Renaming
`agent-log/020_wf_ship-the-split/summary.md` rewrites a link that lives in
`subtasks/040_execution/00_overview.md` — a file an agent was editing at the
time. Measured, not assumed:

```
links from the agents' scopes into a folder being renamed:
  subtasks/040_execution/140_rework-demo-showcase.md   3 links
  subtasks/040_execution/00_overview.md                1 link
  + 5 more files under subtasks/ and notes/
```

So the renames were held until the agents returned, and run by one actor in
sequence. Two link-aware moves in flight at once each rewrite files the other is
mid-way through, and the loser is a silently corrupted file.

## The deletion that justifies the change

The old rule lived in two places as a name list:

```js
AGENT_LOG_RESERVED_FOLDERS = new Set(['working', 'debrief'])   // loader
LOG_RESERVED               = new Set(['working', 'debrief'])   // validator
```

Both are now the same arithmetic — prefix `< 100` is a slot, `>= 100` is a child
activity — expressed once per side with the constant named and documented. Three
consequences, and the third was invisible before:

| | |
|---|---|
| A fourth slot | was a code change in two files. Now it is `04_` |
| Read order of the three slots | was enforced by a hand-written *pin `summary.md` first* rule in `SubdocTree.astro`. **That rule is deleted** — `01 < 02 < 03 < 100` sorts them |
| A child activity could never be *named* `working` | a restriction that existed, was enforced silently, and appeared in no document. Gone |

## The side effect on ordering labels — an under-report that fixed itself

When the ordering label shipped yesterday, one case was recorded as a deliberate
under-report: a round file at `agent-log/020_wf_ship/working/090_x.md` produced
the label `090`, not `020/090`, because the unprefixed `working` segment broke
the walk. Making it accurate would have meant teaching a shared library which
folder names are "pass-through" containers — tracker knowledge in a module the
docs side also uses.

`02_working/` carries a prefix, so the same purely-local rule now yields the
full path. Measured:

```
agent-log/020_wf_ship/working/090_x.md      → 090          (before)
agent-log/020_wf_ship/02_working/090_x.md   → 020/02/090   (after)
agent-log/010_lp_a/100_wf_child/01_summary.md → 010/100/01
```

**The special case was removed rather than added to.** Recorded because it was
not a goal of this change and could easily have gone unnoticed.

Nothing has to be fixed as a result: the validator reports **zero** ordering-label
warnings, because no link in the repo carries a label yet — Sid decided against
backfilling on 2026-08-03, and this confirms that decision cost nothing here.

## The migration, and its control

`migration/0.1.4_agent-log-slot-numbering.py` — `detect` / `migrate [--dry-run]`
/ `verify`, matching the existing migration scripts. It renames the slots **and
rewrites every inbound link**, which is the half that matters: the renames alone
would convert working references into broken ones.

Two things it deliberately refuses to do:

- **A legacy six-slot agent log is skipped whole.** Those are history and are not
  migrated; half-converting one is worse than leaving it.
- **A child activity numbered below 100 is REPORTED, never moved.** Renumbering
  changes its identity, every inbound link and its sort position — that is the
  tracker owner's call, so the script prints the `agent-ks move` command instead.

The control harness is committed at
`verification/agent-log-slot-numbering/control.py` — a scratch tracker built to
contain one of every case, **26 assertions, all passing.** Two matter most:

| Case | Why it is in there |
|---|---|
| A decoy `notes/summary.md` and a link to it | A naive `summary.md → 01_summary.md` replace breaks this, and nothing downstream notices until someone clicks it. It is the control: it proves the rewrite is anchored on the activity folder name |
| A legacy activity with its own `03_working/` | Proves the skip fires. Without it, a clean run over a legacy folder is indistinguishable from never having looked |

**The first run failed one assertion, and the assertion was the thing that was
wrong.** I predicted 3 renames; the script planned 5. Child activities have their
own three slots — that is what makes them activities — so both children
contributed. The count is now enumerated by path rather than counted off the
output, so it cannot be satisfied by the script finding a *different* five.

## Validator behaviour, proved rather than assumed

Run before any rename, so the new checks had something to find:

```
14  unnumbered slot — rename to `01_summary.md` / `02_working/` / `03_debrief/`
 0  duplicate "prefix is below 100" warnings
 0  ordering-label warnings
```

The zero in the middle is a fix made during the round: the file pass and the
folder pass both fired on a bare `working/`, producing two warnings for one
problem. **A validator that says the same thing twice teaches people to skim it**,
so the folder pass now defers to the more specific message.

## Gate

| Check | Result |
|---|---|
| `./start build` | clean, 941 pages |
| Migration control | 26 assertions, all pass, decoy included |
| Issue validator | new checks fire 14×, no duplicates |
| `check-skill-links` | clean across all three skills |

Nothing measurable in the speed/size sense — this is a naming convention, its two
guards and a migration.
