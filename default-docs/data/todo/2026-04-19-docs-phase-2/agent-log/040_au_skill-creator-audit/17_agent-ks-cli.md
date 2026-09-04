---
title: agent-ks-cli — Opus review
---

# agent-ks-cli

**Verdict:** needs fixes — the shape is right, but the stated contract is false on a large part of the command surface, and one documented validator produces findings this repo has already retracted once.

**Measured:** SKILL.md 528 words (body, 597 with frontmatter) · 72 lines · description 65 words · references: `cli-toolkit.md` 106 lines, `contract.md` 81 lines. All three inside the house limits.

The structure is the strongest of the ten skills: one entrypoint, a contract table, a group map, and two references that each own one topic. Siblings link here rather than copy, so "one home per fact" holds. Every relative link resolves (`check skill-links` on this skill: pass, 16 files). The self-test passes. What fails is truth: the contract table describes a CLI that the shipped scripts only partly implement, and the self-test that is supposed to catch that does not check it.

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker | `references/cli-toolkit.md:78`, `SKILL.md:44` | The skill documents `check links` as a plugin validator that reads `dist/`; the repo's own replacement, `scripts/checks/check-links.mjs:16-24`, states that every number produced from `dist/` had to be retracted, and CLAUDE.md names putting a renderer check in the plugin "the original mistake" | An agent that follows the reference runs it, gets 561 "errors" (measured here), and edits content that is correct on disk — the exact failure that cost this project a 341-link revert | Drop `check links` from `scripts/_manifest.mjs`, `SKILL.md:44` and `cli-toolkit.md:78`; leave `check link-form` as the plugin's link tool and let the development-stage `scripts/checks/check-links.mjs` own the renderer question |
| 2 | major | `SKILL.md:26`, `references/contract.md:52` | "2 — Usage error: a missing argument" is false for 13 commands. Every `issue` verb plus `check section` and `move` exits **1** on a missing required argument; only `doc`, `blog`, `git` and `find` exit 2 | `issue show` with a bad id and `issue show` with no id both return 1, so an agent branching on the exit code cannot tell "not found" from "I called it wrong" and will retry or report the wrong cause | Route the usage bail-outs in `issues/*.mjs`, `docs/check.mjs` and `docs/move.mjs` through exit 2, or narrow the SKILL.md row to the truth and say which families differ |
| 3 | major | `SKILL.md:16`, `references/contract.md:29` | "Unknown flag → exit 2 with the valid flags listed. A misspelled filter never widens a result" is false for six commands. `check blog`, `check config`, `check legacy-tags` and `check skill-links` accept an unknown flag **silently and exit 0**; `move` and `img` exit 1 | `agent-ks check blog --jsonn` runs the human path, exits 0, and never says the flag was ignored — the one promise the row exists to make | Have the four validators and `move`/`img` parse through `parseArgs` in `_cli.mjs` like the rest, so the manifest's flag list is enforced everywhere |
| 4 | major | `SKILL.md:8` | "It needs `bun` and nothing else" is false for `img`, which shells out to the ImageMagick CLI (`images/_lib.mjs:4-30`, looks for `magick` then `convert`, exits with an install hint). Neither SKILL.md nor the 9-row `img` table in `cli-toolkit.md:17-27` mentions it | A consumer told the toolkit is dependency-free hits a wall on the one command that has a dependency, with no reason to believe the skill was wrong | Keep the sentence for the CLI, and add one line to the `img` row: "needs the ImageMagick CLI (`magick` or `convert`) — the only command with an outside dependency" |
| 5 | major | `SKILL.md:44`, `references/cli-toolkit.md:73` | "validators; exit 1 on a problem" is misleading for `check issues`. Its template findings are warnings: `check issues --template` printed **424 warnings and exited 0** here. `--strict` is listed as a bare flag name with no description anywhere in the skill | An agent asked "does the tracker pass?" reads exit 0 and reports clean while 424 findings scroll past | Say it in the `check issues` row: findings split into errors (exit 1) and warnings (exit 0); `--strict` promotes warnings to errors. Give `--strict` its one-line description |
| 6 | major | `references/contract.md:63` | "Run `bun scripts/_selftest.mjs` … It checks the new command's `--help`, `-h`, exit codes and `--json`" — the harness checks `--help`, `-h` and `--json` only (`_selftest.mjs:63-82`). No check invokes a command with a bad flag or a missing argument | This is *why* findings 2 and 3 exist and stayed green. An author following §7 believes the exit-code contract is enforced by a gate that never tests it | Either add the two checks to the harness (unknown flag → 2, missing required arg → 2) or delete "exit codes" from the sentence. The first is better: it makes the contract checked rather than remembered |
| 7 | major | `SKILL.md:3` | The description contains no word a user would say. It names `agent-ks`, "contract", "exit codes", "worktree note", "author contract" — jargon of someone who already knows the tool. It never says move, rename, link, image, search, issue or commit. Roughly half of it is a table of contents of the body | The description is the only always-loaded part. A prompt like "shrink these screenshots before I commit" or "rename this page and fix its links" needs this skill and matches nothing in it | Rewrite — see "Proposed description". Trade the table of contents for the verbs a user types |
| 8 | minor | `scripts/_manifest.mjs:152` | `--kind` help says "lp/au/rf/it/wf", omitting `re`. `DEFAULT_KINDS` in `issues/new-agent-log.mjs:32` includes `re: 'research'`, and `templates/log-index-re.md` ships | The skill's own prescribed discovery route (`agent-ks help issue new-agent-log`) returns an incomplete vocabulary, so an agent treats `re` as a custom kind needing a `settings.json` entry | Add `re` to the flag description |
| 9 | minor | `references/cli-toolkit.md:43-44` | Two required flags lose their base: `--log <path>` does not say "relative to `agent-log/`" and `--plan <folder>` does not say "under `plans/`". Both bases are in the CLI help | The reference is billed as "every command and flag"; on the two flags where the value needs an anchor, the agent has to leave it and guess or re-query | Restore the base in both cells, as the CLI help already words it |
| 10 | minor | `references/cli-toolkit.md:43` | The reference names no owner for the value vocabularies (agent-log kinds, statuses, priorities). `agent-ks-issue-logs` owns the six kinds | Correct under "one home per fact", but with no pointer the agent's only route is the CLI help — which is incomplete (finding 8) | Add one link: "the kind codes: `[agent-ks-issue-logs](../../agent-ks-issue-logs/SKILL.md)`" |
| 11 | minor | `references/cli-toolkit.md:3` | "Every command is `agent-ks <group> <verb> [flags]`" is false for the five top-level verbs (`help`, `resolve-context`, `find`, `move`, `img`), which the reference's own General table then lists without a group | A reader taking the opening line literally types `agent-ks general find`. SKILL.md:42 gets this right with a `(none)` group | "Every command is `agent-ks <group> <verb> [flags]`, or a top-level `agent-ks <verb>` for the five in General" |
| 12 | minor | `references/cli-toolkit.md:77` | `check link-form [root]` on a legitimate link-free folder fails with "2 file(s) but zero links parsed — the link matcher is not working" (verified on `default-docs/data/blog`). The guard at `check-link-form.mjs:170` is deliberate for whole-tree runs | The documented positional produces a scary false error, and the message blames the tool | Note the precondition in the row, or scope the guard to a run with no explicit `[root]` |
| 13 | minor | `SKILL.md:64` | The Rules table's last row is about the `[repo source tree]` / `[installed plugin]` banner — a maintainer-only concern, in a skill that ships to consumers who only ever have one tree. `check skill-links` is itself labelled "Maintainer tool" in the manifest | Costs every consumer a rule they can never act on, in the skill's most-read table | Move it beside the `check skill-links` row in `cli-toolkit.md:80`, where the maintainer already is |
| 14 | minor | `SKILL.md:60` | "Search the tracker with `Grep` → `agent-ks issue list` or `agent-ks find`" gives no reason, unlike the `mv` row beside it ("it rewrites every link") | The guide's point: with no reason the agent cannot judge the case the row did not name — for example whether `Grep` is fine for one known file | Add the reason: `Grep` reads text, so it cannot see status, vocabulary or subtask counts, which live in `settings.json` |
| 15 | minor | `scripts/issues/new-round.mjs:203-210` | The "00_index.md not found; add the file line by hand" notice is printed only on the human path. With `--json` it is dropped and the payload carries no field for it, though `cli-toolkit.md:51` promises the command "says so" | An agent using `--json` — which the contract encourages — silently loses the one thing it must then do by hand | Add `indexUpdated: <bool>` to the JSON payload |
| 16 | minor | `scripts/_manifest.mjs:111-112` vs `scripts/issues/subtasks.mjs:37` | The canonical/alias pair is inverted: the manifest calls `--state` canonical and `--status` its alias; the script and `cli-toolkit.md:35` call `--status` canonical | `agent-ks help issue subtasks` contradicts the reference. Both work, so the cost is a doubt, not a failure | Flip the two manifest descriptions to match the script |

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "`agent-ks issue list --state review` exited 2 saying unknown flag — what's the right one?" | yes | yes — "when a command fails, or when you need a flag" catches it squarely |
| "rename `default-docs/data/user-guide/10_configuration/07_versioning.md` to `06_versioning.md` and fix every link that points at it" | yes | no — the description names no verb here; `agent-ks-docs` fires and forwards, so the fact survives, but this skill loses its own strongest trigger |
| "these onboarding screenshots are ~4 MB each, can you shrink them before I commit" | yes | no — `img` is the tool and the description never mentions images |
| "I want to add a `check frontmatter` command to the toolkit — where does the script go and what does it have to honour?" | yes | unsure — "the author contract" is in the description, but it is the skill's word, not the user's |
| "write the guardrails and done-when for subtask 12 before I hand it to an agent" | no | no — `agent-ks-qna` is specific enough to win, though "every read, write, scaffold and check" is broad enough to be a near-miss |

## Proposed description

> Run any `agent-ks` command in an agent-knowledge-system project. One entrypoint, `agent-ks <group> <verb> [flags]`, for listing and searching issues, moving or renaming a page so every link follows, optimising images before a commit, scaffolding subtasks, plans, agent logs and rounds, committing one content path, reading theme tokens, and running the validators. Load it before you run any `agent-ks` command, when one fails or exits 2, when you would otherwise invent a flag, and when you are adding a new command to the toolkit. It holds the contract, the exit codes and the git-worktree note.

Same length as the current one. It trades the table of contents for the verbs a user actually types, and keeps the pushy "load it before you run any command".

## The dry run

Prompt used: *"Open an audit agent log on the docs-phase-2 issue for this skill review, and add its first round file."*

1. Read SKILL.md. The group table gave me `issue new-agent-log` and `issue new-round` in about ten seconds — this is the skill working.
2. Followed "Every command and flag" to `cli-toolkit.md`. Read all 106 lines; needed rows 43-51.
3. **Lost:** `--kind <code> required` with no list of codes and no pointer to the skill that owns them.
4. **Guessed, then checked:** ran `agent-ks-dev help issue new-agent-log`. It answers "lp/au/rf/it/wf" — and `re` is missing, though `templates/log-index-re.md` sits in this skill's own `templates/`. The discovery route the skill prescribes gave an incomplete answer.
5. **Guessed again:** `--log <path> required`, relative to what? Had to re-query help to learn "relative to `agent-log/`".
6. **Did not need:** the 9-row `img` flag table, the `git` and `theme` sections. At 106 lines that is an acceptable cost, not a finding.
7. **Missing:** not one full command line anywhere in the skill. I assembled a five-flag invocation out of a table cell. One example per scaffolder would be the cheapest fix in this report.

## Cut and add

**Cut**

- `SKILL.md:78` (`check links` row at `SKILL.md:44` and `cli-toolkit.md:78`) — finding 1. The whole command goes, not just the line.
- `SKILL.md:64` — the tree-banner rule; maintainer-only, wrong table (finding 13).
- `references/contract.md:63`, the words "exit codes" — the harness does not check them (finding 6).
- `references/cli-toolkit.md:3`, the phrase "Every command is `agent-ks <group> <verb> [flags]`" as an absolute — five commands are not (finding 11).

**Add**

- One worked command line per scaffolder in `cli-toolkit.md`, in a fenced block under the issue table. Six lines total, and it is the thing an agent copies. For example: `agent-ks issue new-agent-log 2026-04-19-docs-phase-2 --kind au --name skill-review --goal "audit the ten skills" --for 29`.
- The ImageMagick dependency on the `img` row (finding 4).
- The error/warning split and what `--strict` does, on the `check issues` row (finding 5).
- The base for `--log` and `--plan` (finding 9), and a link to `agent-ks-issue-logs` for the kind codes (finding 10).
- A reason on the "never Grep the tracker" rule (finding 14).
- The `--report` preconditions on `new-round`: the round file must exist first, and a round holds at most nine reports. Both are errors an agent will hit on its second call, and both are already worded well in the script's own usage text.
