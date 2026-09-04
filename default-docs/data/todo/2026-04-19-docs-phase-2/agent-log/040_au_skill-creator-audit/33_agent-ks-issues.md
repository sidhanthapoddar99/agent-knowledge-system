---
title: agent-ks-issues — re-audit
---

# agent-ks-issues

**Verdict:** needs fixes — every ruling landed and nothing regressed, but one pre-existing line still tells the agent it may set `done` on a subtask, and the new pickup block leaves out the one section that answers "what's next".

**Measured:** SKILL.md 598 body words (cap 600, frontmatter excluded) / 734 with frontmatter · description 132 words, 838 characters · references: 01_anatomy 136 lines, 02_lifecycle 59, 03_writing 55, 04_issue-comments-glossary 98, 05_brainstorm-notes-memory 110, 06_subtasks 146, 07_plans 135, 09_operations 118, 10_examples 108. `08_agent-logs.md` deleted. Every file under the 150-line cap.

Clean on: `agent-ks-dev check skill-links` passes (61 files, `[repo source tree]`); no site-absolute links; no shouty `MUST`/`NEVER`/`ALWAYS`; no history words; every command and flag the skill prints exists in `agent-ks-dev help`; every template file it names exists and its five `#` sections match `templates/subtask.md` byte for byte.

## Closure

All 22 findings ruled `fix` are closed. Finding 21 was ruled `reject` and needs no check.

| First-round # | State | Note |
|---|---|---|
| 0 | closed | `SKILL.md:10` now names the engine and the CLI as the source of truth and demotes the guide to convention the code does not enforce. Decision A applied |
| 1 | closed | `03_writing.md:24`. Verified: `issues.ts` reads `draft` only at `:1541` (tracker root) and `:1569` (issue meta) |
| 2 | closed | `03_writing.md:22`. Verified: `fm.color` is read at `issues.ts:1093` and `:1165` only. `PLAN_STAGE_FM_KEYS` (`check.mjs:99`) does list `color`, so "on a stage it earns no drift warning" is right as written |
| 3 | closed | `09_operations.md:9`. Ran it: `issue list --bogus-flag` prints `unknown flag`, lists 31 valid flags, exits 2. Same on `show` and `new-subtask` |
| 4 | closed | `01_anatomy.md:74` links the logs skill and states no number; `10_examples.md:72` renumbered to `120_wf_shared-fixture/`; `:82` links out. Matches `agent-ks-issue-logs/SKILL.md:55` |
| 5 | closed | `SKILL.md:66` now says `lp`, `it`, `wf` and links the owner for the rest. Matches `agent-ks-issue-logs/SKILL.md:49` |
| 6 | closed | File deleted. No dangling reference anywhere in the plugin; `10_examples.md:28` repointed at the sibling skill; the unique sentence is `SKILL.md:18-19` |
| 7 | closed | The four-step block sits at `SKILL.md:12-21` as ruled, with the index-check pointer. Its remaining gap is N2, not a failed fix |
| 8 | closed | "The four boundaries" cut; duties are two columns. `05:3` now cites the SKILL table for Owns and prints only Holds / Does-not-hold, so the pair no longer overlaps |
| 9 | closed | Description routes docs / blog / config separately |
| 10 | closed | "Agent logs have their own skill" replaces the trigger claim |
| 10a | closed | `05:13` reads `title` and optional `color`. It no longer contradicts `04:90` |
| 11 | closed | 146 lines. "Rapid mechanical changes" cut; the decision is held by `agent-ks-issue-logs/SKILL.md:26-36` |
| 12 | closed | `01_anatomy.md:63` matches `check.mjs:673` exactly, including the silent pass on other file types |
| 13 | closed | `05:110` matches `check.mjs:812` |
| 14 | closed | Level column added and the legend at `01_anatomy.md:94` defines it. Re-verified against `check.mjs:576,577,591,595` and `issues.ts:737-747` |
| 15 | closed | Deleted from SKILL.md. `02:32` is now the skill's only copy — one fewer of the five copies `issue-status.ts:56` complains about |
| 16 | closed | `plans/` carries its slash |
| 17 | closed | `--overview` added. Confirmed present in `agent-ks-dev help issue new-subtask` |
| 18 | closed | A/B/C taxonomy cut to two sentences; the `pattern C` reference at `:76` was fixed too |
| 19 | closed | `01_anatomy.md:73` and `06:26` both say one level, with the reason. Guide side deferred |
| 20 | closed | `01_anatomy.md:87` says plainly what was meant. Verified: `check.mjs:595` has no component-value test |
| 21 | reject | No check |

**Regressions:** none found. The four cut Never rows all have a home elsewhere — the `subtasks:` mark rule at `07:83` (with the validator's own three failure modes), "do not restate a subtask or a plan in a log" at `agent-ks-issue-logs/SKILL.md:16-24`, and both log-opening rules at that file's `:26-36`. The merged `plans/` duty row loses "the goal, what goes where" (held by `07:26`), "a link to the log that ran it" (`07:64,85`) and "never a copied status" (`07:8,62`). No fact was lost.

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | blocker | `references/06_subtasks.md:57` | "Its status is derived from its siblings … `done` once every sibling is Closed. Flipping it is bookkeeping. You may do it." An index leaf is a subtask (`01_anatomy.md:14`), and `check.mjs:177` treats `00_*.md` as one, so this authorises the agent to set `done` on a subtask | It contradicts `SKILL.md:60`, and it contradicts `02_lifecycle.md:42`, which declares itself the one home of closing authority and grants no index-leaf exception. Closing a subtask is the user's | Cut "You may do it". Write: "Flipping it is bookkeeping, and the ceiling is the same as any subtask — `review` or `input-needed`. The user sets `done` (`[closing authority](02_lifecycle.md)`)" |
| N2 | major | `SKILL.md:12-21` | The pickup block has no step for the active plan. `plans/` is the only section that holds order and current focus (`07:3`, `07:108-110`), and `06:19,24` forbid reading sequence out of subtask numbers | "What's next" is the plan's answer and the block never reaches it. `agent-ks issue show` prints no plans section (verified on `2026-04-19-docs-phase-2`), and no `issue` verb lists plans, so an agent that follows all four steps never sees the schedule and falls back on the inference `06` forbids | Add a fifth step: "the active plan under `plans/` — the highest-numbered plan whose status is not Closed — its `overview.md` and its stages (`[plans](references/07_plans.md)`)". Costs ~25 words; see the cut in N7 to stay under the cap |
| N3 | minor | `SKILL.md:19` | "The open log's `00_index.md`" is singular. An issue may carry several non-Closed logs — `2026-04-19-docs-phase-2` has `030_wf_skills-v2-temp` at `open` and `040_au_skill-creator-audit` at `in-progress` | The block gives no tiebreak, so the agent picks one and may read the wrong handover. Every other "which one" in the skill is answered (`07:110` derives the active plan) | "Every non-Closed log's `00_index.md`, newest first. `agent-ks issue show` lists them with their status" |
| N4 | minor | `references/06_subtasks.md:130` | "a Review or Closed subtask whose `02` still carries the placeholder". The real trigger set is `RESULT_DUE` = `review`, `done`, `superseded` (`check.mjs:174`). `input-needed` and `dropped` are excluded | An agent auditing a tracker reports a `dropped` subtask with a placeholder `02` as a defect the validator never raises | "on a `review`, `done` or `superseded` subtask whose `02` still carries the placeholder" |
| N5 | minor | `references/01_anatomy.md:100-124` | The tracker-vocabulary section is the skill's one home for the root settings file and omits two live keys that `TRACKER_ROOT_KEYS` accepts (`check.mjs:79`): `template: true`, which turns the five-section lint on for the whole tracker (`check.mjs:172`), and root `draft: true`, which makes the whole tracker dev-only (`issues.ts:1541`) | `06:130` attributes the template lint to `--template` alone, so an agent meets template warnings on a plain `check issues` run with nothing explaining them | Add two rows to the vocabulary table: `template` — "`true` runs the five-section lint on every check, no flag needed"; `draft` — "`true` hides the whole tracker from the production build" |
| N6 | minor | `references/03_writing.md:34` | "The prefix grammar … : `[anatomy](01_anatomy.md)`". Anatomy states only "`NN_` or `NNN_`" (`:28`). The grammar — 2–5 digits, sorted by numeric value so widths coexist, `_` canonical and `-` tolerated (`order-prefix.ts:23-25`) — is stated only at `06_subtasks.md:51`, under a subtask heading, and the 2–5 bound appears in no skill file in the plugin | The pointer promises a rule its target does not carry. An agent naming a stage `5_retention.md` gets `check.mjs:457`'s warning that the skill never predicted | Move one sentence into `01_anatomy.md`'s glossary row: "2–5 digits, sorted by numeric value, so `01_` and `010_` coexist and `5_` does not parse. `_` is canonical; the loader tolerates `-`." Then `06:51` keeps only the subtask-specific advice |
| N7 | minor | `SKILL.md:57-67` | Decision H says a Never row carries its reason when the pair does not imply it. One of nine rows does (`:66`). Seven carry none: frontmatter drift, closing, old wording, `Grep`, `mv`, backticked paths, unsaved discussion | The body is 598 words against a 600 cap, so there is no room to add seven reasons — the cap and the decision are in conflict in this one skill, and the conflict is not written down anywhere | Give a reason to the two rows whose reason an agent cannot guess — `Grep` ("the CLI reads the schema and hides Closed by default") and `mv` ("it breaks every relative link in silence") — and link the rest. Fund it by cutting `SKILL.md:23-27` "The one rule", ~45 words that `03_writing.md` and every reference's Holds / Does-not-hold table already enforce |

## The dry run, second time

Prompt: *"I'm picking the docs-phase-2 issue back up — where did we get to, and what's next?"*

1. **Better, and it is the whole story.** SKILL.md answers the prompt at line 12. No Triage roulette, no listing `references/` to find the missing step. Round 1 was lost at step 1; this run was not.
2. Step 1 ran clean. `agent-ks-dev issue show 2026-04-19-docs-phase-2` printed status, 11 subtasks by state, 6 comments and 4 agent logs with their statuses — enough to reach step 4 without a second command.
3. I did not open `01_anatomy.md` or `03_writing.md`. Round 1 loaded both on a guess. About 190 lines of context saved.
4. `04:5` no longer competes with SKILL.md for the pickup rule; it points back at it. The two-homes problem is gone.
5. Still wrong: **"what's next" was not answered.** The block never names `plans/`, and `issue show` prints no plans section, so the schedule stayed invisible (N2). I answered from subtask states, which `06:24` says is exactly what not to do.
6. Still wrong: step 4 says "the open log's", and this issue has two non-Closed logs. I read both indexes to be safe (N3).
7. Small friction: `agent-memory/` does not exist on this issue and the block does not say to skip an absent step.
8. Nothing marks the end of the sequence. After step 4 I went back to Triage and guessed `06_subtasks.md` for "what's next" — the right file, still a guess.
9. Once oriented, the rest held. `09_operations.md` gave the right search command first time, and `--status all` behaved exactly as `:17` describes.
