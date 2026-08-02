---
title: "Audit brief — is the skill in order, and is it consistent?"
status: in-progress
agent: claude
---

# Goal

Two days of convention changes landed fast, several of them reversing decisions
made the day before. **Find where the skill, the framework code, the CLI, the
in-app guide and the user-guide now disagree with each other** — and where any
of them still describes something that no longer exists.

The failure this exists to catch is the one that has already happened three
times this week: **a surface that looks correct because nothing checks it.**

# Inputs

## What changed, in order — the gist

| # | Change | Where it bites |
|---|---|---|
| 1 | **Plans section shipped** — `plans/NN_<name>/` with `settings.json`, `overview.md`, `NN_<stage>.md` stages | new section everywhere |
| 2 | **Reference by link, never by number** — repo-wide rule | every doc |
| 3 | **Ordering label** — link text may open with the target's ordering path, `[040/100 name](path)`. `move` rewrites it; the validator warns on drift | writing rules |
| 4 | **Plan table reworked** — columns are now `# · Stage · Status · Who · Outcome · Notes`. The subtask **count column is gone** | plans docs |
| 5 | **`notes:` stage field**, inline markdown. `outcome:` became inline markdown too | stage frontmatter |
| 6 | **Both sidebars lead with their symbol** — `symbol NN name`. Plans list in plain ascending order; the active plan is **marked, not hoisted** | UI docs, legend artifact |
| 7 | **Agent-log slots numbered** — `01_summary.md` / `02_working/` / `03_debrief/`; a child activity is prefix **≥ 100**. The name-set rule is gone; the sidebar's pin-summary-first sort rule is **deleted** | everything about agent logs |
| 8 | **`agent-logs:` frontmatter RETIRED** — the stage ref list is subtasks only; a run is linked from the stage **body** with an ordering label | plans docs, fixtures |
| 9 | **A stage body is free-form** — `## Todo` / `## Questions` are conventions, not a schema | plans docs |
| 10 | **Plan page structure** — the table has a `Stages` heading, the right rail indexes Overview → Stages → each stage → its headings, stage headings render as markdown `#` + `---` | plans docs |

## New subtasks opened by this work

| Subtask | State |
|---|---|
| [the ordering label](../../../subtasks/080_ordering-labels.md) | shipped; no backfill, by Sid's decision |
| [the plan table rework](../../../subtasks/090_plan-table-rework.md) | shipped; one item waiting on Sid's eyes |
| [agent-log slot numbering](../../../subtasks/100_agent-log-slot-numbering.md) | shipped; screenshot recapture waiting on Sid |
| [the using-with-AI page](../../../subtasks/110_using-with-ai-page-stale.md) | **open** — found stale in four independent ways |

## Things proposed but NOT done

- Backfilling ordering labels onto existing links — **decided against** by Sid.
- A `--relabel` bulk pass — unscheduled, "only if a real need appears".
- Recapturing `user-guide/19_issues/assets/demo-agent-log.png`, which still
  shows the old slot names — **needs Sid**, prose cannot fix an image.
- The version bump — **held on Sid's word**, and note the release now carries a
  second breaking content change with migration `0.1.4`.

## What is already known to be true

Do not spend time re-deriving these; they are gated on every commit:

```
./start build                       945 pages, clean
agent-ks check issues               51 folders, 0 errors, 1 pre-existing warning
check-skill-links.mjs               clean across all three skills
verification/agent-log-slot-numbering/control.py            30 assertions pass
verification/agent-log-slot-numbering/legacy-detector-control.mjs  pass
```

# Expected Outcome

One report per scope, carrying per finding: severity, `file:line`, the concrete
failure, whether it was **reproduced and with which command**, and the
refutation attempted. **Name the areas checked and found clean** — a named clean
area is signal; silence is not.

> The brief originally sent both halves to `<activity>/audit/<scope>.md`, which
> is this project's orchestration convention — and which **this repo's own rule
> rejects**: an audit report is an iteration file, and there is no `audit/`
> folder ([24_agent-logs.md](../../../../../../plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md)).
> The validator agreed, warning on the folder. Both reports now sit beside this
> file as the pair they are — [141](./141_audit-skill-consistency-opus.md) and
> [142](./142_audit-executor-followability-sol.md), sharing iteration 14 with
> this brief as its iteration file. The cross-project conflict is real and is
> flagged for Sid; the repo whose code enforces the rule won.

# Outcome

Both halves returned. **6 high · 6 medium · 9 low**, merged as a union.

## The two that mattered

**A validator hole on exactly the path this week's change prescribes.** The
plans validator built its list of valid `subtasks:` targets from `subtasks/`
*and* `agent-log/`, but the renderer resolves against subtasks alone. So a stage
pointing `subtasks:` at an agent-log file passed the gate **and** drew the red
"resolves to nothing" block on its own page. Retiring `agent-logs:` tells an
author to move a run link somewhere, and `subtasks:` is the only other
structured list on a stage — the trap sat at the end of the migration the docs
prescribe. The index is now split, and the two failure modes get different
messages: *does not exist* versus *exists but is not a subtask, link the run
from the body*.

**One stray filename silenced every agent-log rule on a valid run.** The
retired-shape detector skipped a folder carrying `03_working`, `04_benchmark`,
`05_notes` or any root `NNN_*.md` — and the skip is a bare `return`, so the
folder was checked by nothing and reported nothing. Silence and clean are the
same output. Measured against the real corpus: **no historical run is
identified by any of those three names alone** — every one also carries
`00_goal` or `02_task_list`. So the marker set narrowed to the two names the
current shape cannot produce, a current slot now wins outright before any
retired marker is read, and a loose root file counts only where there is no
`01_summary.md`. History stays exactly as quiet as before: 51 folders, 1
pre-existing warning, unchanged.

The classifier moved to [`_agent-log-shape.mjs`](../../../../../../plugins/agent-ks/skills/agent-ks-docs/scripts/issues/_agent-log-shape.mjs)
so its control imports **the real predicate**. The old control restated the
regexes and therefore passed with the defect live — it could only ever prove
that two copies agreed, which was never in question.

## Verdicts

| Finding | Verdict | What was done |
|---|---|---|
| Validator accepts an agent-log target in `subtasks:` | **fix** | index split; distinct message per failure mode; battery mutant `M21` |
| Retired-shape detector masks a valid run | **fix** | positive signal first, marker set narrowed on measured evidence, classifier extracted + controlled |
| Scaffolder recipes document a `--issue` flag that does not exist | **fix** | 10 sites corrected to the positional form. Found by BOTH halves |
| `agent-logs:` still taught as live in two field tables | **fix** | rows corrected; `notes:` added where it was missing. Found by BOTH halves |
| 1-digit prefix passes and makes the wrong plan active | **fix** | validator now uses the shared `parseOrderPrefixLoose`, so it and the loader cannot disagree |
| `relink` corrupts links in an unmigrated sibling | **fix** | a slot counts only once renamed on disk; permanent mixed-tree case in the control |
| Migration `--help` omits `relink` | **fix** | usage documents all four modes and what `relink` is for |
| Node fallback is documented but cannot work | **fix** | the dispatcher now refuses with an install hint instead of dying on an import |
| User-guide teaches the retired sidebar row order | **fix** | two prose sites + the anatomy sketch |
| "Active plan pinned at the top" survives, including in the docblock that removed it | **fix** | both sites |
| Anatomy sketch has no Plans section | **fix** | added |
| `check-skill-links` silently checked one skill of three | **fix** | defaults to every skill; errors when a scope reads zero files |
| Child-log numbering example does not match the CLI | **fix** | `100/110/120…`, matching `--parent` |
| `30_broken-ref-demo.md` demonstrates no broken ref | **partial fix** | renamed to `30_insert-with-room.md`. The fixture stays clean **by decision** — a permanently broken ref would make this repo's gate runnable only with "expect one error", and a gate like that stops being run |
| Lone producer file with no iteration file is never reported | **defer** | a real gap; a threshold change with its own blast radius, and the round is already large |
| Six skill rules nothing checks | **defer** | recorded as a map of where the manual is the only enforcement, not as defects |
| `agent-ks` on PATH is a stale 0.6.7 | **defer — Sid's** | this is the version bump, held on his word. The consequence is concrete: the installed plugin cannot run this week's scaffolders, and a session loading the installed skill reads the pre-plans manual |

## What the round says about itself

Both halves independently found the `--issue` flag and the stale `agent-logs:`
table. Two reviewers reaching the same defect from *reading* and from *running*
is the strongest signal in the set, and both were pure documentation — the
class this issue keeps rediscovering.

The Opus half also reported that **the tree changed under it** mid-run, and
re-derived every shifted line reference rather than reporting against a version
that no longer existed. That is the correct behaviour and worth naming: the
plan-stage routing rework landed during the audit and was therefore **not
covered by it**.
