---
title: agent-ks-issue-logs — Opus review
---

# agent-ks-issue-logs

**Verdict:** needs fixes — the model is right and matches the shipped code, but the status field it teaches is silently discarded by the engine, the numbering it shows cannot be produced by the command it documents, and the user guide still describes a different format.

**Measured:** SKILL.md 1555 words body (1650 with frontmatter), 155 lines · description 91 words · references: none (single-file skill)

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker | `SKILL.md:139-141` (engine defect at `astro-doc-code/src/loaders/issues.ts:1381`) | The skill says `settings.json` holds the run's status, but the engine marks any folder with prefix < 100 as a slot and never reads its `settings.json`; every top-level log the scaffolder makes is `010_`, `020_`, `040_` | An agent follows the skill, writes a status, and it is never read or rendered — only child logs (`120_`+) get a status. `DetailSidebar.astro:76` filters `reserved` folders out of the status map | Fix the engine, not the skill: `isAgentLogSlotFolder` must apply only *inside* an activity, not at the `agent-log/` root — pass the depth into `readAgentLogGroups`'s walk |
| 2 | blocker | `SKILL.md` whole file vs `default-docs/data/user-guide/19_issues/05_sub-docs/05_agent-log.md` | The user guide describes a different agent log: `01_summary.md` (five `#` sections), `02_working/` flat iteration files, `03_debrief/`, no per-kind file sets, five kinds. The skill describes `00_index.md`, per-kind file sets, six kinds | The house rule says the user guide wins, so an agent that reads it builds the wrong shape — one already did, in the untracked `030_wf_skills-v2-temp/`. Two live formats in one tree | Rewrite the user-guide page to the `00_index.md` model. The code sides with the skill: `guide.ts:250`, all seven `log-index*.md` templates, `check.mjs:822`, `02_lifecycle.md:48` all say `00_index.md`; only the user guide (last touched 2026-08-13) is stale |
| 3 | major | `SKILL.md:94-99` and `:145-151` | The `au` tree shows `10_codex.md` + `11_opus.md`, but `new-round` as documented gives `10_codex.md` then `20_opus.md` — `11_` needs `--report`, which the skill never mentions | The agent produces a folder that does not match the skill's own example and never learns the round/report model (`new-round.mjs:85-115`) | Add one line to `## Commands`: "A round file's prefix ends in `0`. A second file in the same round is a report: `new-round … --report` writes `11_`, `12_`, up to `19_`." |
| 4 | major | `SKILL.md:66-68`, `:151` | `05_guidelines.md` (and any sub-10 prefix like the `05_brief.md` in this very folder) cannot be made by the CLI — `new-round` derives round ≥ 1 and `--round` rejects `0`; there is no `--prefix` on `new-round` | The skill's own `lp` example names a file its documented command cannot write, and the escape hatch it gives ("a file with a plain name is written by hand") does not cover a *numbered* file | Change the sentence to "A file the round numbering cannot reach — a plain name, or a prefix below `10` — is written by hand; add its line to `## Files` yourself." |
| 5 | major | `SKILL.md:151` | "Search the tracker with `agent-ks issue agent-logs <id>`, never with `Grep`" — `agent-logs` prints the last N logs for one issue and takes no query (`--last`, `--full`, `--json`, `--tracker` only) | The agent is pointed at a verb that cannot do the job it is named for, then has no correct search verb and falls back to `Grep` anyway | Say: "List an issue's logs with `agent-ks issue agent-logs <id>`. Search inside them with `agent-ks issue list --search <regex> --search-fields agent-log`, or `agent-ks find`. Never `Grep`." |
| 6 | major | `SKILL.md:80-87` | The `rf` tree gives `00_index.md` + `10_watch-out.md`; the template the scaffolder actually writes (`log-index-rf.md`) says `10_changes.md` (what moved where) and `20_watch-out.md`, and `guide.ts:243` agrees with the template | The skill claims "The scaffolder writes the index with that set named in it" — for `rf` it does not, so the agent gets an index that contradicts the skill it just read | Make the `rf` tree `10_changes.md` + `20_watch-out.md`, matching the template and `guide.ts` |
| 7 | major | `SKILL.md:3` vs `agent-ks-issues/SKILL.md:3` | The sibling's description claims "agent logs … audit, refactor, loop, autonomous run" as its own, and is the broader skill; nothing in it routes to this skill until its body is already loaded (`agent-ks-issues/SKILL.md:84`) | On "run an audit on issue X and keep the reports", the broad sibling is the likelier single match, so this skill under-triggers on exactly its own work | Drop "agent logs" and "audit, refactor, loop, autonomous run" from the sibling's description and add "For an agent log use agent-ks-issue-logs". Add the situation words to this description (see Proposed description) |
| 8 | major | `SKILL.md:59-137` | 79 of 155 lines are the six kind trees. Only one kind is ever in hand, and the scaffolder already writes that kind's file set into `00_index.md` from the template | Half the file is context the agent pays for on every trigger and uses once, duplicating text a script emits — the progressive-disclosure and leanness checks both fail here | Cut the six trees to one line each in a table (code · what it is · who opens it · slots), and let `00_index.md` carry the set. If the examples are wanted, move them to `references/kinds.md` and say "open the row for the kind you are about to create" |
| 9 | major | `SKILL.md:89-99` | The `au` kind is the one that most often uses an external reviewer, and the skill never mentions the round file's `agent:` frontmatter (`--agent` on `new-round`), which names the tool that produced the finding | An audit run through Codex or a hosted model loses the record of which tool found what — the exact thing the `au` shape exists to preserve | Add to the `au` section: "Name the tool in the file's `agent:` frontmatter (`new-round --agent codex`) — the finding is the tool's, and a finding that lives only in a job record dies with the run." |
| 10 | minor | `SKILL.md:47` | "Never open a second log for work that belongs to an open one" and "A verify never earns a file" carry no reason | A rule with no reason does not generalise: the agent cannot judge the case the sentence did not name | Give each half its reason: a second log splits one run's record across two handovers; a verify has an expected answer of "no" and changes nothing about what you did |
| 11 | minor | `SKILL.md:141` | "nothing else in a log is checked" — `check.mjs` also warns on a kind code outside the issue's effective set (`check.mjs:879`) and errors on unparseable JSON or frontmatter | Small over-claim; an agent may be surprised by a warning it was told could not exist | Say "the shape is not checked; the values are — status, kind code, and that the JSON and frontmatter parse" |
| 12 | minor | `SKILL.md:10-14` and `agent-ks-issues/references/08_agent-logs.md` | The two-jobs paragraph is written out in three places: here, in the sibling's pointer stub, and in `guide.ts:224-228` | One home per fact. The stub restates rather than points | Cut the stub to one sentence plus the link; `guide.ts` is a deliberate framework-bundled twin and stays |
| 13 | minor | `SKILL.md:94`, `:108`, `:122` | The `au`, `re` and `it` trees are drawn at `agent-log/` root but keep the child prefixes `120_`, `130_`, `140_` lifted from the `lp` example | It blurs the one crisp rule the skill teaches — that `120`+ means "inside another run" | Renumber the root-level examples `020_`, `030_`, `040_`, and keep `120_` only where the tree is genuinely nested |
| 14 | minor | `SKILL.md:143-151` | The skill never says what `<id>` is, and never mentions that a log may hold an `assets/` folder for images | Small guesses at the start of a task | One clause: "`<id>` is the issue folder name. A log may carry an `assets/` folder beside the index." |

Note, outside the skill: `agent-ks help issue new-agent-log` lists the kinds as `lp/au/rf/it/wf`, missing `re` (`_manifest.mjs:152`). The engine (`issues.ts:337`), the scaffolder (`new-agent-log.mjs:32`) and the templates all ship six. The skill is right; the CLI help is stale.

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "we're kicking off an overnight loop on the search issue tomorrow — set up somewhere the next session can pick it up from" | yes | yes — "loop", "long-horizon run", "handover" are all in the description |
| "codex and opus both went over the loader and came back with about two hundred findings between them. where do these go so nothing gets merged away by accident?" | yes | unsure — the prompt says "findings" and "reviewers", the description says "audit folder". A near-miss the noun list does not cover |
| "before you stop, update the handover in `040_au_skill-creator-audit/00_index.md`" | yes | yes — "handover" and "any file under agent-log/" both hit |
| "add a subtask to docs-phase-2 for the link checker and set it to review" | no | no — the closing line "For subtasks, plans, notes and the rest of the tracker use agent-ks-issues" sends it away cleanly |

## Proposed description

> Use for any agent log in an agent-knowledge-system issue tracker — the working folder of one run, under an issue's `agent-log/`. Covers when a run earns a log and when it does not, who decides, the six kinds (`lp` loop, `rf` refactor, `au` audit, `re` research, `it` iteration, `wf` workflow), the file shape of each, what a log never holds, the run statuses, and the commands that scaffold one. Trigger on agent log, loop, overnight or long-horizon run, audit, several reviewers on one target, research over many segments, refactor log, iteration, workflow, handover, "where do these findings go", "so the next session can pick it up", or any file under `agent-log/`. For subtasks, plans, notes and the rest of the tracker use agent-ks-issues.

The change is the middle: swap the bare noun list for the situations that produce a log — a pile of findings needing a home, a run that must survive the session — because that is what a user actually types.

## The dry run

Prompt: *"Codex and Opus both reviewed the loader. Set up the agent log so their two hundred findings have a home, then I'll merge the verdict."*

1. Read the skill top to bottom. "What a log is for" and "When a run earns a log" answered it fast: `au`, the agent opens one, say so in the reply. Good.
2. Jumped to the `au` section, took the tree: `00_index.md`, `10_codex.md`, `11_opus.md`, `20_fixes.md`. Clear.
3. `agent-ks issue new-agent-log <id> --kind au --name loader --for 010` — worked, but I had to guess `<id>` was the issue folder name; the skill never says.
4. `new-round --log … --name codex` → `10_codex.md`. Correct.
5. `new-round --log … --name opus` → **`20_opus.md`**, not `11_opus.md`. Lost here. Nothing in the skill mentions `--report`; I had to open `cli-toolkit.md` to find the round-vs-report rule.
6. Wanted a `05_brief.md` for the two reviewers, the way this audit folder does it. No CLI path — `--round 0` is rejected. The skill's "written by hand" line only covers *plain* names, so I guessed.
7. Wanted `agent:` on each reviewer file to name the tool. Not in the skill; found `--agent` only in the CLI help.
8. Set `settings.json` to `in-progress` as instructed. It renders nothing — the folder is `040_`, below 100, so the engine never reads it.
9. Did not need: five of the six kind trees, ~65 lines, loaded and unused.
10. Missing throughout: the round/report numbering model, which is the one mechanical thing this task needed.

## Cut and add

**Cut**

- `SKILL.md:59-137` — five of the six kind trees. Only the kind in hand is ever used, and the scaffolder writes that kind's file set into `00_index.md` already. A one-row-per-kind table plus `references/kinds.md` keeps every fact and returns ~65 lines.
- `SKILL.md:10-14` — compress the two-jobs opening to two sentences. It is stated again in `agent-ks-issues/references/08_agent-logs.md` and `guide.ts:224`.
- `SKILL.md:49-51` — "Two things are the same in every log" restates the folder-name and index facts the `## Commands` section states again at line 151. Keep one.

**Add**

- The round/report numbering model, in `## Commands`: a round prefix ends in `0`; `--report` takes `11`–`19` inside round 1. Without it the `au` tree cannot be built.
- `--agent` on `new-round`, in the `au` section, with the reason: the finding belongs to the tool that produced it.
- How to write a file the numbering cannot reach (`05_brief.md`), and that its line goes in `## Files` by hand.
- One clause saying `<id>` is the issue folder name.
- The reasons behind the two bare rules at line 47.
- After finding 1 is fixed in the engine: nothing. If it is not fixed, the Status section must say that only child logs render a status, so the agent is not writing into a void.
