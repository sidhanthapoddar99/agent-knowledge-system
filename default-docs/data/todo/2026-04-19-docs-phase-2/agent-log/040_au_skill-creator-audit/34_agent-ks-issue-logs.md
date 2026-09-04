---
title: agent-ks-issue-logs — re-audit
---

# agent-ks-issue-logs

**Verdict:** needs fixes — every ruled fix landed except two halves, and the engine fix for finding 1 works at the root but opened a regression one level down.

**Measured:** SKILL.md 941 body words (1069 with frontmatter), 77 body lines · description 124 words, 731 characters · references: `kinds.md` 120 lines, 782 words

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | `issues.ts:1385` now guards with `groupPath.length > 0`, so a top-level `010_lp_…` is no longer a slot; its `settings.json` status is read and reaches `DetailSidebar.astro:74-77`. See N1 for what the same line broke |
| 2 | defer | user-guide sync. `05_agent-log.md:79-84` still teaches `01_summary.md` / `02_working/` / `03_debrief/`. Not re-argued |
| 3 | closed | `SKILL.md:75` states the round/report model. Verified against `new-round.mjs:96-117`: `--report` sets `round = maxRound` and takes digit 1–9, so `11_`–`19_` in round 1 is exact |
| 4 | closed | `SKILL.md:75` covers a prefix below `10`. Verified: `_lib.mjs:315` requires `prefix >= 10` for a file to count as a round, so `05_guidelines.md` is unreachable by the CLI |
| 5 | closed | `SKILL.md:77`. Both verbs exist; I ran `agent-ks-dev issue list --search reaudit --search-fields agent-log --count` and it returned the match |
| 6 | closed | `kinds.md:40-44` is `10_changes.md` + `20_watch-out.md`, matching `templates/log-index-rf.md` and `guide.ts` |
| 7 | partly | `agent-ks-issues/SKILL.md:3` now ends "Agent logs have their own skill, agent-ks-issue-logs", which is the routing the finding asked for. It still claims "an audit, a refactor, a loop, an autonomous run"; the verdict said to drop those. This skill's own description took the proposed text |
| 8 | closed | Six trees replaced by a 6-row table at `SKILL.md:40-47` plus `references/kinds.md` (120 lines, under the 150 cap). The link says when to open it |
| 9 | partly | `--agent` reached `kinds.md:65,68-69` but only on the `--report` line. See N2 |
| 10 | closed | `SKILL.md:36` gives both reasons: two half handovers, and a verify's expected answer |
| 11 | closed | `SKILL.md:61` matches `issues/check.mjs:821-860` and `:876-880` exactly — status, kind code, JSON and frontmatter parse |
| 12 | closed | `agent-ks-issues/references/08_agent-logs.md` is gone; no stale inbound link (`agent-ks-dev check skill-links` passes, 10 skills, 61 files) |
| 13 | closed | `kinds.md` root trees are `010_`, `020_`, `030_`, `040_`, `050_`, `060_`; `120_`+ appears only inside the `lp` tree |
| 14 | closed | `SKILL.md:65` defines `<id>`; `:81` names the `assets/` folder |
| CLI note | closed | `agent-ks-dev help issue new-agent-log` lists `lp/au/rf/re/it/wf` |
| add (index-check) | closed | `SKILL.md:81` carries `/agent-ks-index-check <path>` |

**Regressions from the fix round:** none inside the two skill files. Every claim I re-checked against the CLI, the templates and the engine is true. The one regression is engine-side, N1.

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | major | `astro-doc-code/src/loaders/issues.ts:1385` (engine) | The finding-1 fix disabled the slot rule for the whole root, so it now decides by depth where it should decide by name: a grouping folder at the root is treated as a run, and a run inside a grouping folder is still treated as a slot | Live case `2026-04-10-issues-layout/agent-log/exploration/` now enters the status map with `status: null` and draws a "no status set" dot, which `SubdocTree.astro:147` was written to suppress. The other half is the original defect, unfixed: `new-agent-log --group phase-1 --kind lp --name x` writes `phase-1/010_lp_x/`, prefix 10 < 100 at depth 1, so its `settings.json` status is discarded exactly as before | Test the name, not the depth. Carry "is my parent a run" through the walk: a run is `NNN_<code>_<name>/`; `reserved` = parent is a run ? `isAgentLogSlotFolder(name)` : `!RUN_FOLDER.test(name)` |
| N2 | major | `references/kinds.md:64-66` | `--agent` is shown only on the `--report` command. `new-round.mjs:133` defaults `agent` to `claude`, so an agent copying the `au` block writes `10_codex.md` with `agent: claude` | The first reviewer is silently mis-attributed to Claude — the opposite of what finding 9 was fixed for, and worse than an absent field because it reads as a fact | Show the flag on both calls: `new-round <id> --log 030_au_loader --name codex --agent codex`, then the `--report --agent opus` line |
| N3 | major | `SKILL.md:49` | "Ask first for `lp`, `it` and `wf`, because each commits days that the user scopes." The reason is false for `it`, which `kinds.md:92-98` defines as odds and ends — pointers, benchmarks, scratch | The rule is right and its stated reason contradicts the skill's own definition, so an agent generalising from the reason ("does this commit days?") opens an `it` without asking. `agent-ks-issues/SKILL.md:66` carries the same wrong reason | Split it: "`lp` and `wf` commit days that the user scopes. Ask for `it` too, because a miscellany nobody asked for is clutter the user has to read" |
| N4 | major | `SKILL.md:61` | The Status section names the five values and never says who may set them. `02_lifecycle.md:40-44` holds the answer — an agent closes its own log and its own rounds — and this skill is the one that owns log facts | The user's standing rule is that `done` and `dropped` are theirs. An agent that applies it to a log never closes one, so every log stays `in-progress` and the sidebar dot stops meaning anything | One clause: "You close your own log and your own rounds; the user's ceiling rule covers issues and subtasks, not runs. `new-agent-log` writes `in-progress` for you" |
| N5 | major | `SKILL.md` whole file | 941 body words against the 600 cap in decision I. The skill lost its single-file exemption the moment `references/kinds.md` was added | The cap is a house rule and this is 57 % over it. See the ruling below for what should move | Move `## Commands` and the file-length hint into `kinds.md`; trim two restatements. Detail below |
| N6 | minor | `references/kinds.md:39-44,54-60,82-90,100-105,115-120` | Five of the six trees omit `settings.json`; only the `lp` tree shows it. `SKILL.md:53` says every log has one, and it is where the status lives | An agent copying a tree literally builds a log with no status file — the field N1 and finding 1 exist to make render | One line in the preamble: "Every tree also has `settings.json`; `new-agent-log` writes it and `00_index.md` for you" |
| N7 | minor | `SKILL.md:77` | "Never `Grep`." carries no reason, against decision H | The agent cannot judge the case the sentence did not name — a grep over a worktree, say | Add the why: the verbs know the tracker's shape and scope by status; a grep returns lines with no issue, no run and no status attached |
| N8 | minor | `references/kinds.md:29-30` | Restates `SKILL.md:75`'s hand-written-file rule almost word for word ("Write that file by hand and add its line to `## Files` yourself") | One home per fact. The reference should instantiate the rule, not repeat it | Cut to "`05_guidelines.md` sits below `10_`, so write it by hand — see `SKILL.md` § Commands" |
| N9 | minor | `references/kinds.md:88` | The `re` tree numbers a second peer segment `11_self-hosted/`, while `SKILL.md:75` teaches that `N1`–`N9` means a report inside round `N` | Two meanings for `11_` inside one skill blurs the numbering model the fix round just added | Number peer segments `10_`, `20_`, and move the side-by-side to `30_comparison.md` |

## The word-cap ruling

**I agree in part.** No section is dead weight, and the fix agent is right that none of it is reference-only trivia. But "trigger-time" is not the test the guide sets — the test is *needed at every trigger*, and this skill has two distinct triggers: **decide and route** (does this earn a log, which kind, what never goes in it, what do I read before continuing) and **operate** (scaffold it, number the files, append, hand over). Only the first fires every time. A session that appends one round file to an open log pays for the whole decision apparatus, and a session deciding whether to open a log pays for the command mechanics.

Three inbound links constrain what may move: `cli-toolkit.md:43` cites this SKILL.md for the kind codes, `01_anatomy.md:74` and `10_examples.md:82` for the child-log numbering, and `agent-ks-issues/SKILL.md:66` for which kinds need no ask. All three facts sit in `## The six kinds` and `## The shape` and must stay.

What should move, and it clears the constraint:

| Move | From | To | Words |
|---|---|---|---|
| `## Commands` in full | `SKILL.md:63-78` | `kinds.md`, as a `## Scaffolding` section above the kind sections | −160 |
| "Keep files short…" | `SKILL.md:57` | same | −28 |
| The closing paragraph of "What a log never holds" — only its last clause is new | `SKILL.md:24` | fold that clause into the section lead | −35 |
| The "Stay without one when" column — it negates the left column row for row | `SKILL.md:30-34` | one sentence after the table | −25 |

`kinds.md` is 120 lines and has 30 lines of headroom under its own cap, and it is already the file the agent opens at the exact moment it needs a command — "open the row for the kind you are about to create" is the same instant as "run `new-agent-log`". SKILL.md keeps one pointer line. Nothing in finding 3's or finding 9's fix is lost; both already have their worked example in `kinds.md`'s `au` section.

That lands SKILL.md near **690**. Folding `## What a log is for` into the H1 lead and tightening the six kind descriptions reaches roughly **620–650**. Below that, every further word costs a rule. So: make the four moves, and record 650 as this skill's floor rather than pretending 600 is reachable.

## The dry run, second time

The same prompt: *"Codex and Opus both reviewed the loader. Set up the agent log so their two hundred findings have a home, then I'll merge the verdict."*

1. Better — the description now catches it outright on "several reviewers on one target" and "where do these findings go". No hesitation, where round one was `unsure`.
2. Better — the six-kind table gave `au` in one row. I loaded 6 lines of other kinds instead of ~65. This is the single largest improvement.
3. Better — `kinds.md`'s `au` section is the only reference I opened, and it held the tree, the verdict rule and the command.
4. Better — `<id>` is defined at `SKILL.md:65`, so no guess.
5. Better — `new-round … --report` produced `11_opus.md` on the first try. Round one lost five steps here.
6. Better — the `05_brief.md` case is covered by `SKILL.md:75`; I wrote it by hand and added its `## Files` line without leaving the skill.
7. Better — `settings.json` at `in-progress` is now read by the engine, so the status is no longer written into a void.
8. Still wrong — I wrote `10_codex.md` without `--agent`, because `kinds.md` shows the flag only on the second call. The file claims `agent: claude`. That is N2, and it is the one thing this task still gets wrong.
9. Still wrong — at the end I did not know whether I could set the log to `done` myself. The user's standing rule says closing is theirs; the Status section does not carve runs out. I had to open `02_lifecycle.md`. That is N4.
10. Did not need: nothing. Every line I read, I used.
