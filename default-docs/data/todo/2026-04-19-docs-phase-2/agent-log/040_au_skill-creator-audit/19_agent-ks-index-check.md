---
title: agent-ks-index-check — Opus review
---

# agent-ks-index-check

**Verdict:** needs fixes — the approach is right and the procedure is unusually well reasoned, but the log path fails on the shape this tracker actually holds, and two of the four labels duplicate CLI verbs the skill cannot reach.

**Measured:** SKILL.md 467 words body / 540 with frontmatter, 57 lines · references: `procedure.md` 135 lines, 1628 words · agent `agent-ks-index-checker.md` 229 words. Both house limits pass (SKILL.md < 600 words, reference < 150 lines). No site-absolute links, no history words, no bare capital MUST/NEVER. `agent-ks-dev check skill-links` clean.

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker | `references/procedure.md:12`, `:130` | The log kind is pinned to the literal name `00_index.md`; §9 then says stop when no index is found. 35 agent-log folders in this tracker carry `01_summary.md`; exactly one carries `00_index.md`, and this audit created it | A live dispatch on `2026-08-02.../agent-log/030_wf_harness-instruction-coherence/` returned "Index check cannot proceed" and checked nothing. The most common real target produces no answer | Resolve the log's index leaf by pattern — lowest-prefixed `0*_*.md` — exactly as §1 already does for a subtask group's `00_*.md`, and name the file chosen. (Migrating the content is the other half, but the checker should not be the thing that breaks) |
| 2 | major | `SKILL.md:5`, `references/procedure.md` §4 | `ORPHAN` is fully covered by `agent-ks check link-form`, which resolved 1012 links across 155 files of one issue in one second and named 4 dead targets with file:line. The skill never mentions it, and `allowed-tools` carries no Bash so the agent cannot run it | House rule: the CLI is the tool for the tracker. Hand-resolving links with a haiku model is slower, less complete, and duplicates a deterministic verb | Say in SKILL.md: run `agent-ks check link-form` for `ORPHAN` first, then spend the agent only on `MISSING`, `STALE` and `INFERENCE`, which no script can do. Add Bash to `allowed-tools` and to the agent's `tools` |
| 3 | major | `references/procedure.md:59` | The subtask-group leaf check — "the leaf's own `status` still `open` or `in-progress` when every member is closed" — is already implemented by `agent-ks check issues`, which warned on exactly this shape tracker-wide in one run | Same duplication, and the CLI version covers 55 issue folders while the skill covers one path per invocation | Delete the leaf-status row from §5 and point at `agent-ks check issues`. Keep only the claims that need reading *through* a reference |
| 4 | major | `SKILL.md:3` | The description never uses the words a user says: "stale", "out of date", "still accurate", "does it still match". Meanwhile `agent-ks-issues` claims "plans, agent logs … any file under a tracker folder" | The sibling is broader and names the same nouns, so it wins the routing. The guide asks descriptions to be pushy; this one is not | See "Proposed description" below |
| 5 | major | plugin-wide | No sibling skill links to this one. `agent-ks-issues/references/08_agent-logs.md` and `agent-ks-issue-logs/SKILL.md:155` both say keep the index current, and neither says how it gets checked | The recorded design intent (`subtasks/110_tracker-ergonomics/025_an-index-is-checked-not-generated.md`) was that the check lives in the skill *already loaded*. Moving it to its own skill lost that, and nothing replaced the pointer | Add one line to `08_agent-logs.md` and `07_plans.md`: to check an index against its folder, use `/agent-ks-index-check <path>` |
| 6 | major | `references/procedure.md:100` vs `:68-74` | §6 numbers five plan checks; §7 says a plan gets rows 0 to 4, with check 5 folded into row 0. The mapping is never stated | Verified live: the dispatched run emitted rows 0-3 and silently dropped check 4's row. The numbering itself caused the omission | Number the coverage rows the same as the checks. Make row 0 "check 5 / direction B" explicitly, or renumber §6 as 0-4 |
| 7 | major | `SKILL.md:3` and `references/procedure.md` §7 | "A whole issue folder" is advertised as a supported input, and §1 says check every kind in the kinds table, but §7 gives no report shape for more than one index kind — no row numbering, no grouping, no budget | This is the largest and most likely invocation ("is this issue folder still true?") and it is the least specified. The agent must invent the shape | Add a §7 paragraph: for an issue folder, one Direction B section and one Direction A section per kind, then one coverage table with a `kind` column. State a per-kind cap |
| 8 | major | `agents/agent-ks-index-checker.md:4` | `model: haiku` for an audit whose whole value is precise cross-file bookkeeping | Live plan run: it wrote its findings twice, once as narrative and once as the formatted report, which §7 line 100 explicitly forbids; dropped a coverage row; and left check 2's boxes unlabelled. It did find the one real `STALE`, so this is quality drift, not failure | Raise to sonnet, or keep haiku and cut the procedure to what haiku can hold — findings 2 and 3 remove the two heaviest parts anyway |
| 9 | major | `SKILL.md:18` | "Dispatch … in the foreground." The Agent tool has no foreground mode; it backgrounds the run and notifies on completion | An instruction the agent cannot act on, in the one row that carries the dispatch | Replace with "wait for the report before you reply" — that is the behaviour actually wanted |
| 10 | minor | `references/procedure.md:71` | Check 2 names the section `01 To Do`. Real stage files use `## Todo`; only the template uses `01 To Do` | A checker searching for the named heading finds none and skips the check | Say "every unticked checkbox in the stage, wherever it sits" |
| 11 | minor | `references/procedure.md:49` vs `:71` | §4 says an unticked box "is the same claim in checkbox form" → `STALE`; §6 check 2 requires the linked target to be closed before it is a finding | The live run read the loose version, called three open boxes a concern, then gave them no label and left them out of the findings | Make §4 defer: "an unticked box is a claim; it is `STALE` only against a closed target — see check 2" |
| 12 | minor | `references/procedure.md:59`, `:70` | The disagreement tests name only `review` and closed. `blocked` and `input-needed` are two of the eight statuses (`astro-doc-code/src/loaders/issue-status.ts:19-28`) and never appear | An index calling a subtask open whose file says `input-needed` is a real disagreement and goes unreported | Say "`review`, `input-needed`, or closed" |
| 13 | minor | `references/procedure.md:26` | §2 offers "a shell — `ls -A`" as a listing tool. The dispatched agent has `tools: [Read, Grep, Glob]` and SKILL.md `allowed-tools` has no Bash | A dead row for the primary consumer; live evidence that the Grep fallback also misreports — the run listed files inside `02_working/` and `03_debrief/` but never named the two folders as entries | Drop the shell row unless finding 2 adds Bash. Say that `Glob */*` reveals a folder only through its contents, so an empty folder needs a second look |
| 14 | minor | `references/procedure.md:53` | "List the subtasks and stages the run's files touched" gives no method | For a log with a dozen files the agent either skips it or reads everything | Name the move: Grep the log folder for `subtasks/` and `plans/`, then diff against the `Serves:` line |
| 15 | minor | `SKILL.md:17` | "The path is relative — resolve it against the current directory", then dispatch | A subagent need not share the caller's cwd; a relative path can resolve differently on the other side | Say: resolve to an absolute path before you dispatch |
| 16 | minor | `SKILL.md:24-32` vs `references/procedure.md:18-20`, `:47-49` | The two-directions table and the list-before-you-read rule are stated in full in both files | The dispatched agent reads both and pays twice. One home per fact | Keep the pair in SKILL.md (the relay needs the vocabulary), cut §4's restatement to a pointer |
| 17 | minor | `references/procedure.md` §4, §7 | `INFERENCE` is one of the four labels but appears in neither §4's diff table nor §7's report example; it exists only inside §6 check 1 | An agent that leans on §4 and §7 has no place to put an `INFERENCE`, which is the label a human most wants | Add an `INFERENCE` line to §7's Direction A example |
| 18 | minor | `references/procedure.md:130` | §9's "say so, list what is there, stop" gives no report shape, so it escapes §7 | The live log run returned a free-form note with no count line and no coverage table — unrecognisable as this skill's output | Say: still write the count line and row 0, then stop |

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "check whether the index in `default-docs/data/todo/2026-08-02-refactor-efficiency-and-planning/plans/01_fix-the-tools-then-the-links/` still matches the files" | yes | yes — "index" and a path are both in the description |
| "the plan on the refactor-efficiency issue says stage 40 is still open but I closed those subtasks last week, is the whole plan stale now?" | yes | unsure — the description contains neither "stale" nor "plan … out of date" as user words, and `agent-ks-issues` names "plans" in its own trigger list |
| "before I write the wrap-up, sweep the issue folder and tell me what it claims that is no longer true" | yes | no — no word here matches the description. "sweep", "claims", "no longer true" are all absent |
| "add a line to the agent log index for the file I just wrote" | no | no — correctly routes to `agent-ks-issue-logs`, which owns writing the index |

Two of three should-fire prompts are the phrasing a real user reaches for, and the description catches at most one cleanly. That is finding 4.

## Proposed description

> Check whether an index in an agent-knowledge-system tracker has gone stale — whether a plan, an agent log, a subtask group, `issue.md` or a whole issue folder still says what is true on disk. Use it whenever someone asks if a plan is out of date, whether an issue folder can still be trusted, what a folder claims against what is there, or asks for an index sweep before a wrap-up or at the start of a session that inherited someone else's work. Reports only, never edits, so it is safe to run on anything. Invoke it with the path as the argument.

Rationale: it adds the words a user says (stale, out of date, trusted, sweep, wrap-up, inherited), it names the four triggers the agent file already lists, and "safe to run on anything" is the push that beats a broader sibling without stealing writing work from `agent-ks-issue-logs`.

## The dry run

Prompt used, twice, dispatched to the real `agent-ks:agent-ks-index-checker` exactly as `SKILL.md:18` specifies — once on a plan folder, once on an agent-log folder.

1. Read SKILL.md, saw the dispatch row, dispatched. The skill's "do not read the index first" rule is good and I followed it.
2. Log run: the agent listed with Glob, found `01_summary.md`, `02_working/`, `03_debrief/`, `settings.json` — and stopped at "Index check cannot proceed" because no file was named `00_index.md`. Nothing was checked. Finding 1.
3. It also reported the six files *inside* the two subfolders but never named the subfolders as entries, so direction B on them never happened. Finding 13.
4. Its output had no count line and no coverage table, so it did not look like this skill's report at all. Finding 18.
5. Plan run: 119 s, 50k tokens, 28 tool calls. It found the one real `STALE` — `overview.md` says "every stage at `review`, none at `done`" while all four stage files say `status: done`. Correct and useful.
6. But it wrote every check out in prose first, then wrote the formatted report underneath — the second copy §7 exists to prevent.
7. Its coverage table had rows 0-3. Check 4 was done in prose and never got a row. Finding 6.
8. Check 2's three unticked boxes were called "open work items" with no label and then dropped from the findings. Finding 11.
9. What I did not need: nothing in SKILL.md was wasted on me as the dispatcher, which is the split working.
10. What was missing: no guidance on what to do when the log index is not named `00_index.md`, and no report shape for an issue folder — the input I would most often hand it.

## Cut and add

**Cut**

- `references/procedure.md:26` — the shell `ls -A` row. No consumer of this procedure has Bash.
- `references/procedure.md:47-49` — §4's restatement of the two directions. `SKILL.md:24-32` already holds it and both are read.
- `references/procedure.md:59`, second sentence — the leaf-status check. `agent-ks check issues` already emits it tracker-wide.
- `references/procedure.md` §4, the `ORPHAN` row — replaced by a pointer to `agent-ks check link-form`, per finding 2.
- `SKILL.md:18` — "in the foreground". Unactionable.

**Add**

- A rule for resolving a log's index leaf by pattern, mirroring `:13`'s `00_*.md` for subtask groups.
- A §7 paragraph for the whole-issue-folder case: sections per kind, one table with a `kind` column, a per-kind cap.
- One worked `INFERENCE` line in §7's example.
- `input-needed` alongside `review` in every disagreement test.
- A pointer from `agent-ks-issues/references/07_plans.md` and `08_agent-logs.md` back to this skill, so an agent already in the tracker learns the checker exists.
- One sentence in SKILL.md placing the CLI first: `check link-form` and `check issues` answer the mechanical half, and the agent is spent only on the claims that need reading through a reference into another file's state.
