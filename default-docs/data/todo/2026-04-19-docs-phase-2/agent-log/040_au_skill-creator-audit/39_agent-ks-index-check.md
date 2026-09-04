---
title: agent-ks-index-check — re-audit
---

# agent-ks-index-check

**Verdict:** needs fixes — seventeen of eighteen findings closed and the dry run is transformed, but the fix for finding 1 resolves the log's index leaf to `00_goal.md` in 24 of the 45 agent-log folders in this tracker, which turns a hard stop into a confident wrong answer.

**Measured:** SKILL.md 594 body words (frontmatter excluded), 68 lines · references: `procedure.md` 144 lines, 1932 words · agent `agent-ks-index-checker.md` 75 body words, `model: sonnet`, `tools: [Read, Grep, Glob, Bash]`. Both caps pass, each by six (600 words, 150 lines). No history words, no site-absolute links, no bare capital MUST / NEVER / ALWAYS. `agent-ks-dev check skill-links` passed on the `[repo source tree]`, 61 files.

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | partly | The hard stop is gone and the chosen file is named, but "the lowest-prefixed `0*_*.md`" picks `00_goal.md` in 24 of 45 log folders. See N1 |
| 2 | closed | `## Run the CLI first` names both verbs; `allowed-tools` and the agent's `tools` both carry Bash. Both commands verified against the CLI |
| 3 | closed | `procedure.md:64` now hands the leaf-status claim to `agent-ks check issues` |
| 4 | closed | `SKILL.md:3` is the proposed description, word for word |
| 5 | closed | Pointers land in `agent-ks-issues/SKILL.md:21`, `references/07_plans.md:135` and `agent-ks-issue-logs/SKILL.md:81` |
| 6 | closed | `procedure.md:79` and `:107` state the mapping in both directions |
| 7 | closed | `procedure.md:119` gives the issue-folder shape: one Direction B section, one Direction A subsection per kind, one table with a `kind` column, five findings per kind |
| 8 | closed | Source says `model: sonnet`. Not exercised live: the dispatchable agent is the installed 0.10.1 build, which is `haiku` with no Bash |
| 9 | closed | `SKILL.md:29` — "Wait for the report before you reply, then relay it" |
| 10 | closed | `procedure.md:76` — "Every unticked checkbox in the stage, wherever it sits" |
| 11 | closed | `procedure.md:52` defers to check 2, though it narrows the rule on the way. See N5 |
| 12 | closed | `input-needed` sits beside `review` at `:63`, `:64`, `:76`, `:77`. Verified against `issue-status.ts`: eight statuses, closed = `done` · `dropped` · `superseded` |
| 13 | closed | The shell row stays, correctly, because finding 2 added Bash. The `Glob */*` caveat is at `:30` |
| 14 | closed | `procedure.md:58` names the move: Grep the log folder for `subtasks/` and `plans/`, diff against `Serves:` |
| 15 | closed | `SKILL.md:28` — resolve to an absolute path, with the reason |
| 16 | closed | `procedure.md:47` is now a pointer to the skill |
| 17 | closed | `procedure.md:103` carries a worked `INFERENCE` line |
| 18 | closed | `procedure.md:139` — write the count line and row 0, then stop |

Seventeen closed, one partly, none open.

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | blocker | `references/procedure.md:12` | "The leaf is the lowest-prefixed `0*_*.md` file" resolves to `00_goal.md` in 24 of the 45 agent-log folders here; `00_index.md` resolves in exactly 1, `01_summary.md` in 12, and 8 folders hold no `0*_*.md` at all | `00_goal.md` is a goal statement sitting beside `01_summary.md`. None of the 24 carries `## Files` or `## Handover`, so Direction A cannot run and Direction B would call almost every file `MISSING`. The old text checked nothing and said so; this text checks the wrong file and reports | Resolve by role, in order: `00_index.md`; else the lowest-prefixed `0*_*.md` that holds a `## Files` section; else `01_summary.md`. Never `00_goal.md`. When none qualifies, §9 applies |
| N2 | major | `references/procedure.md:62-63` | The two Direction A checks for a log leaf are keyed to the sections `## Files` and `## Handover`. One log folder in this tracker holds a leaf with either; the other 44 do not, and the procedure never says what to do when the section is absent | The coverage table loses both its rows and the agent fills the hole itself. Live: the log run wrote rows 0 and 1 and invented row 1's name, "index prose vs file status", instead of the two `not run` rows `:107` requires | Add one line to §5: when the leaf carries neither section, test its prose state claims against the frontmatter `status` of the files beside it, and name the absent section in the row |
| N3 | major | `references/procedure.md:90`, `:121` | `<M> index file(s)` is never defined, and on a plan the stages are themselves indexes — checks 2 and 3 read claims out of them | The headline count contradicts its own body. Live: the plan run led with "4 finding(s) across 2 index file(s)" and then reported findings from `overview.md` plus three separate stage files | Say in §7 what counts as an index file per kind. For a plan: `overview.md` plus every stage that carries a checkbox or a `subtasks:` list |
| N4 | major | `SKILL.md:18` and `references/procedure.md:54`, §7 | `ORPHAN` now comes from `agent-ks check link-form`, but §7's report shape gives it no section and never says whether the CLI's hits enter the `<N> finding(s)` count — while the label table (`SKILL.md:45-52`) and §9 (`:144`) both still name it | The lead number is ambiguous on the one label the agent no longer derives itself. This is finding 17's defect, moved from `INFERENCE` to `ORPHAN` by the fix that closed finding 2 | Add an `ORPHAN` line to §7's Direction A example, and one sentence: the CLI's `ORPHAN` findings count toward N and are quoted with the file and line the script gave |
| N5 | minor | `references/procedure.md:52` vs `:76` | §4 says an unticked box is `STALE` "only against a closed target". Check 2, which §4 defers to, says the finding is a box whose target says `review`, `input-needed` or closed | §4 is the passage an agent reads first, and it is narrower than the check it points at, so a box over a `review` target is dropped. This is the fix for finding 11 losing finding 12's widening | Make `:52` read "only against a target at `review`, `input-needed` or closed — see check 2" |
| N6 | minor | `references/procedure.md:51` vs `:30`, `:34` | Direction B says "strike every file the index names off the listing", and §2 says count folders as entries — but nothing says whether a prose sentence describing a folder discharges the files inside it | Live: the log run took 5 leaf files as the entry set and let "three rounds are recorded in `02_working/`" strike all of them off, reaching `0 MISSING` by a route the procedure does not sanction | One line: the entry set is what §2's per-kind table names. For a log that is the files and folders beside the leaf. A folder is named or it is `MISSING`; its contents are not the entry set |

## The dry run, second time

The same two targets, the same dispatch to the real `agent-ks:agent-ks-index-checker`, with the CLI run first and its findings passed in, per `SKILL.md:14-29`.

1. Caveat first: the dispatchable agent is the installed 0.10.1 build — `haiku`, `tools: [Read, Grep, Glob]`. It read the repo-source procedure because the prompt gave the absolute path, which `SKILL.md:29` requires; both runs quoted "lowest-prefixed `0*_*.md`", a phrase only the source holds. So the fixed text ran; the `sonnet` fix did not.
2. Better: the log run no longer stops. It named `01_summary.md` as the leaf it chose, ran both directions and returned one real `STALE` — the summary says round 2 is in flight while all three round files say `status: done`. Finding 1's symptom is gone.
3. Better: the plan run returned all five checks as rows 0 to 4, in the mapping `:107` states. Round one dropped check 4's row entirely.
4. Better: it found four `STALE` findings, not one, and every unticked box now carries its label and its target's status. Findings 10 and 11 show in the output.
5. Better: row 4 read `not run: section not found — overview.md uses ## Outcome`, which is `:107`'s escape used correctly. That is legacy content, not a skill defect.
6. Better: no second copy of the findings in prose. Round one wrote every check twice.
7. Still wrong: the log run's coverage table has two rows and the second is invented. §5 gives that kind two Direction A checks and §7 says an unrunnable row says `not run`. N2.
8. Still wrong: "4 finding(s) across 2 index file(s)" against a body that reports from four files. N3.
9. Still wrong: a generic sentence about `02_working/` was allowed to discharge the five files inside it, and the two folders were never counted as entries. N6.
10. Not exercised: the blocker. Both targets happen to be folders where the pattern picks the right file. Dispatching the same prompt at `2026-04-10-editor-diagrams/agent-log/010_lp_display-first-implementation/` would resolve `00_goal.md`, which is what N1 is about.
