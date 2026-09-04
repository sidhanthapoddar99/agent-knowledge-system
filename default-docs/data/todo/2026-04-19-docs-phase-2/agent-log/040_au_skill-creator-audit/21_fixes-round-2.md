---
title: Verdicts and fixes, round two
---

# Round two: verdicts on the re-audit findings

Same four verdicts as [20_fixes.md](./20_fixes.md): **fix**, **defer**, **reject**, **engine**. Decisions A to I still hold. Numbers are the re-audit reviewer's `N` numbers.

## New cross-cutting decisions

- **J. Search is a regex.** Wherever a skill writes `--search '<…>'`, it shows a real regex form: one distinctive word, or roots joined by `|`. A dictated phrase never matches. (First written as `\|`, which is a literal pipe in the CLI's regex and returns nothing; the quick-idea-note fix agent measured it. Corrected in `kinds.md` after the round.)
- **K. Every validator splits errors (exit 1) from warnings (exit 0).** Read the counts, not the exit code. `check issues --template` prints the whole tracker's warnings; read only the lines naming the file you wrote.
- **L. Issue pickup has one home,** the four-step block in `agent-ks-issues/SKILL.md`, now five steps (the active plan added). Other skills link it; none restates it.

## Engine and CLI, this round

| Item | Verdict | Note |
|---|---|---|
| issue-logs N1: slot rule keyed on depth | engine, done | `readAgentLogGroups` now decides by name and parent: under a run the slot rule; elsewhere a folder is a run when it matches `NNN_<kind>_<name>` and a grouping folder otherwise |
| docs N1, N2: a file's own `NN_` prefix never enters the sort tuple; only `sidebar_position` or 999 | defer, engine | Real. The fix is two lines in `data.ts` and `useSidebar.ts`, but it reorders the sidebar of every site that leaned on the 999 fallback. Sid's call. The skill states the truth now |
| config N5: `resolveAlias` regex drops a hyphenated alias | fix, cli agent | `^@([\w-]+)\/?(.*)$` in `config/check.mjs` |
| cli N3: `check issues` manifest text for `--verbose`, `--strict` | fix, cli agent | Copy the script's own two lines |
| qna N5: `check issues` has no `--scope` | defer, CLI | The skill carries the scoping sentence (decision K) |
| blog N1: the blog index caps at ten, no pagination | defer, engine | The skill states it as a renderer gap |
| blog N3: `agent-ks move` does not rename a post's assets folder | defer, CLI | The skill says to move it with a second `move` |

## Deferred list, additions

Add to the table in `20_fixes.md`: the sidebar sort tuple, blog pagination, `move` renaming a post's assets folder, `check issues --scope`.

## agent-ks-config (30)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | Collision loop after `chosen_root` is fixed |
| N2 | fix | File vs directory wording; add `config`, `.env.example` |
| N3 | fix | Escape all four substitutions, `\|` in the class |
| N4 | fix | The version step goes into the printed block, between `.env` and `./start --detach` |
| N5 | fix, doc side | Narrow the claim. The regex is the cli agent's |
| N6 | fix | |
| N7 | fix | |
| N8 | fix | Ten skills, `agent-ks-qna` in the row |

## agent-ks-docs (31)

| # | Verdict | Note |
|---|---|---|
| N1, N2 | fix, doc side | State what orders a file today. The engine change is deferred |
| N3 | fix | |
| N4 | fix | Delete the table, link `writing.md#frontmatter` |
| N5 | fix | One line in SKILL.md's CLI section; cut the `data/` map paragraph to fund it |
| N6–N9 | fix | N9: the `assets/` row gets its reason; the other two may point at the reference |
| blog 5, add | fix | Closed by N4, N6, N5 |

## agent-ks-blog (32)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | Ten newest, two tags, no pagination, file it |
| N2–N6 | fix | N6: add `check link-form` to step 5 and the table |
| N7 | fix | Cut both duplicates |
| dry run 8 | fix | The `image` row says what to do meanwhile: leave it unset, or an external URL |

## agent-ks-issues (33)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | Cut "You may do it". The ceiling is the same as any subtask |
| N2 | fix | Fifth pickup step: the active plan. Decision L |
| N3 | fix | "Every non-Closed log, newest first" |
| N4–N6 | fix | |
| N7 | fix | Reasons on `Grep` and `mv`; cut "The one rule" to fund it |
| artifacts N2 | fix | `05_brainstorm-notes-memory.md:65`: the theme claim per mode, link `publishing.md#theme-modes` |
| dry run 7 | fix | One clause: skip a step whose folder is absent |

## agent-ks-issue-logs (34)

| # | Verdict | Note |
|---|---|---|
| N1 | engine, done | |
| N2 | fix | `--agent` on both calls |
| N3 | fix | Split the reason; also fix the same reason in `agent-ks-issues/SKILL.md` (issues agent) |
| N4 | fix | Who closes a log: the agent, its own log and rounds |
| N5 | fix | The four moves the reviewer lists. Record the floor in the reply, not in the skill |
| N6–N9 | fix | |
| first-round 7 | fix, issues agent | Drop "an audit, a refactor, a loop, an autonomous run" from the issues description |

## agent-ks-qna (35)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | `<id>` positional |
| N2 | fix | Replace "Before you ask" with the one-line link to the pickup block. Decision L |
| N3 | fix | Decision J |
| N4 | fix | Under 600 after N2 |
| N5 | fix, doc side | Decision K |
| N6 | fix | The path form for a stage |
| N7 | fix | Placeholders in the skeleton |
| N8 | fix | Change the example's subject to a job not yet done, or drop the path |
| dry run 8 | fix | Second tie-break: work vs test |

## agent-ks-artifacts (36)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | The three URL forms; a disk-relative path does not resolve |
| N2 | fix, issues agent | |
| N3–N8 | fix | N8: publishing.md becomes Triage row 1 |

## agent-ks-cli (37)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | `move` and `img` reject, exit 1 |
| N2 | fix | Decision K, stated once for the group |
| N3 | fix, manifest | |
| N4–N6 | fix | |
| config N5 | fix, script | `config/check.mjs` regex |

## agent-ks-quick-idea-note (38)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | Decision J, show the form |
| N2 | fix | Closed match: say it shipped, ask regression / follow-up / covered |
| N3 | fix | `issue subtasks <id> --quiet-tips` as the shape check; the append variant in steps 4 and 5 |
| N4–N6 | fix | |

## agent-ks-index-check (39)

| # | Verdict | Note |
|---|---|---|
| N1 | fix | Resolve by role: `00_index.md`; else the lowest `0*_*.md` with a `## Files` section; else `01_summary.md`. Never `00_goal.md` |
| N2–N6 | fix | |
