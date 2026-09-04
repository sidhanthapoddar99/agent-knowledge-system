# Index check: the procedure

The procedure behind [the index-check skill](../SKILL.md). Terms: an index is a file that lists other files and makes claims about them. Direction A follows the index to the files. Direction B lists the files and diffs the listing against the index. Closed means `done`, `dropped` or `superseded`.

## 1. Resolve the path

| Given | Check |
|---|---|
| one `.md` file | that one index |
| an issue folder (`settings.json` plus `issue.md`) | every kind in the kinds table |
| `plans/<NN_name>/` | `overview.md`, `settings.json`, every stage |
| `agent-log/<NNN_kind_name>/` | the log's index leaf against the files beside it. Resolve the leaf by role, in this order: `00_index.md`; else the lowest-prefixed `0*_*.md` that holds a `## Files` section; else `01_summary.md`. Never `00_goal.md` — it states the goal and claims nothing about a file, so testing it reports on the wrong file. When none of the three is there, section 9 applies. Name the file you chose, so the reader can tell which file you tested |
| `subtasks/<NNN_group>/` | the group's index leaf: any file that matches `00_*.md` |
| a whole tracker | say so, and ask for one issue. A tracker-wide sweep is too large for one run |

A path that does not exist: say so and stop. Do not guess what the caller meant.

## 2. List the folder first

List two levels deep before you open the index. Reading the index first tells you what to expect, and then you find exactly that.

| Tool | Use |
|---|---|
| `Glob` | pattern `*`, then `*/*`, against the path |
| `Grep`, when there is no `Glob` | pattern `.`, output mode `files_with_matches` |
| a shell, through `Bash` | `ls -A` on the path and on each sub-folder |

"I could not list the directory" is not a result. It is a tool you have not tried. Say which tool you listed with. Write the listing out, so it is a record and not a memory.

`Glob */*` names a folder only through the files inside it, so a folder holding no files never appears. List one level at a time as well, and count the folders as entries.

| For | List |
|---|---|
| an agent log | every file and every folder beside the index leaf |
| a subtask group | every `.md` beside the `00_*.md` leaf |
| a plan | every stage file beside `overview.md` and `settings.json` |
| an issue folder | every section folder and its contents |

Files that are structure, not entries: `settings.json`, `overview.md`, the index itself, an `assets/` folder. Exclude them, and say which you excluded.

## 3. Read the index and resolve every link

A link in frontmatter, inside a checkbox, or in the middle of a sentence all count. For each target, read the first ten lines: `title` and `status`. Read a target in full only when the index makes a prose claim you must judge. A link that resolves proves the file exists. It proves nothing about what the index says about that file. Read the `status` of every target you resolve.

## 4. Diff both directions

The two directions and the four labels are defined in [the skill](../SKILL.md). Here is the move for each.

| Direction | Do | Finding |
|---|---|---|
| B | Strike every entry the index names off the listing, one by one. The entry set is what section 2's table names for the kind: for a log, the files and folders beside the leaf. A folder is named or it is `MISSING`; the files inside it are not entries, so a sentence about a folder discharges the folder alone. What is left over | `MISSING` |
| A | In both, and they disagree. This includes every prose claim about state: "NOT DONE", "still open", "parked", "not swept". An unticked `[ ]` box is a claim of the same kind. It is `STALE` only against a target at `review`, `input-needed` or closed — see check 2 | `STALE` |

`ORPHAN` comes from `agent-ks check link-form <path>`. It resolves every link and names each dead target with its file and line. Take the caller's findings, or run it yourself. Do not resolve links by hand. The script reaches every link, and a hand pass does not.

## 5. The kinds

Direction B is the same move for each kind: list, strike off, report the rest. Two kinds need a second listing. For a log's index leaf, `Grep` the log folder for `subtasks/` and `plans/`, collect the paths those matches link to, and report every one the `Serves:` line does not name. For `notes/` and `brainstorm/` cross-references, list both folders and report every file no index, note or `issue.md` points at. Direction A differs.

| Index | Direction A: test these claims |
|---|---|
| the log's index leaf, section `## Files` | a file line contradicted by the file itself |
| the log's index leaf, section `## Handover` | a handover that says a subtask is open while the subtask says `review`, `input-needed` or closed. An empty handover while finished files sit beside it |
| `subtasks/<NNN_group>/00_*.md` | an entry the leaf calls open whose file says `review`, `input-needed` or closed. `agent-ks check issues` already reports a leaf whose own `status` lags its members, tracker-wide, so leave that claim to the CLI |
| `issue.md`, where it points at its own sections | a mention of a note, a plan, a brainstorm or a log that is not on disk |
| `notes/` and `brainstorm/` cross-references | a pointer to a note that moved or graduated; a "still being decided" whose target records the decision |
| a plan | the five checks below |

Most log leaves carry neither `## Files` nor `## Handover`. Run both rows anyway: test every state claim the leaf's prose makes against the frontmatter `status` of the files beside it. Name the absent section in the coverage row, so the reader knows which shape you found.

## 6. The plan case

A stale stage is different. Every fact in it is correct and the conclusion is wrong. Example: the stage links four subtasks, all four are closed, and the stage still reads `in-progress`. Answer all five checks by name, including the ones that come back consistent.

| # | Check | Finding |
|---|---|---|
| 1 | Stage `status` against its `subtasks:` list. Resolve every link on every stage. Report each stage where every subtask is closed and the stage is not. Give the counts and name each status. `dropped` is not `done` | `INFERENCE` |
| 2 | Every unticked checkbox in the stage, wherever it sits. Open every one. The finding is a box whose target says `review`, `input-needed` or closed | `STALE` |
| 3 | The plan's `settings.json` status against its stages. `open` while every stage sits at `review`, `input-needed` or closed is a finding. So is a written result in `overview.md` while the plan says `open` | `STALE` |
| 4 | `overview.md` section `02 Status and Result` against the subtasks it names. An entry that has moved on is a finding | `STALE` |
| 5 | Direction B on the plan folder: a stage file that `overview.md` never mentions. This check is coverage row 0 | `MISSING` |

An index that explains why it is stale is still stale. Checks 2 to 5 compare two files. The target's frontmatter is the evidence, whatever reason the index gives. Report the disagreement and let the reader decide which file moves.

Check 1 alone carries a caveat. A stage's status describes the schedule, not the work. A stage does not have to wait for its subtasks. An all-closed stage that is still open is an observation for a human, never an error. Do not extend this caveat to checks 2 to 5.

## 7. The report

Write the findings first. Then count them and fill the header from that count. Lead with the count and the verdict. Then the findings by direction, B first, even when B is empty. Then the coverage table. Then what you read. `<M>` counts the index files you read a claim out of: for a plan, `overview.md` plus every stage that carries a checkbox or a `subtasks:` list; for a log, the leaf; for a subtask group, the `00_*.md` leaf; for an issue folder, every index you checked across the kinds. The `ORPHAN` findings from `agent-ks check link-form` count toward `<N>`. Quote each one with the file and the line the script gave, so the reader can check it.

```
<N> finding(s) across <M> index file(s).

## Direction B: files the index does not mention

- **MISSING**: `<log>/` holds `30_parser-audit.md` and `40_cut-back.md`;
  `00_index.md` section `## Files` lists neither

## Direction A: claims the index makes that do not hold

### <relative/path/to/00_index.md>

- **STALE**: <the index says X>; <the file says Y>
  `<relative/path/to/target.md>`: `status: done`
- **INFERENCE**: stage `40_ship` reads `status: in-progress`; all 3 subtasks
  it lists say `done`. False if the stage still holds unlisted work
- **ORPHAN**: `00_index.md:31` links `./20_cut-back.md`; no such file
  (reported by `agent-ks check link-form`)
```

The coverage table has one row per check and carries evidence. Run every row before you write the findings above it. A row you cannot run says `not run` with the reason. The last column holds what you read, not what you concluded: counts and statuses, quoted. Every index gets row 0: the listing, with the count on disk and the count named. Row 0 never reads `n/a`. A plan gets rows 0 to 4, five rows for the five checks: row 0 is check 5, and rows 1 to 4 are checks 1 to 4. Any other index gets row 0 plus one row per Direction A check its kind lists in section 5, in that order. One table, at the end, with no second copy.

```
| # | Check | What I read |
|---|---|---|
| 0 | DIR B: folder listing vs index | 8 files beside `00_index.md`; index names 6; 2 MISSING |
| 1 | stage status vs its `subtasks:` list | 4 stages @ `review`; 10 refs: 9 `done`, 1 `dropped` |
| 2 | unticked boxes vs their targets | 3 unticked: `080`=`done`, `060`=`done`, `040`=`done` |
| 3 | plan `settings.json` vs its stages | plan=`open`; stages=`review`x4; `overview.md` `02` holds a result |
| 4 | `overview.md` `02` vs the subtasks it names | "left open" names `060`, `080`, `040`; all `done` |
```

A whole issue folder holds several kinds, so it gets one report and not one per kind. Write a single Direction B section for the folder. Then write one Direction A subsection per kind, headed by the kind. Keep one coverage table and give it a leading `kind` column. Cap each kind at five findings, and say how many you folded, so a large folder still returns a report a reader can hold.

Finish with what you read: index files checked and targets resolved, as counts. Name what you did not reach. A clean result is a real answer: say "no disagreements found" and list what you checked. Do not manufacture a finding.

## 8. Quality

| Rule | Form |
|---|---|
| Both sides, both paths | "The index says X. The file says Y." Never "this looks out of date" |
| Paths | relative to the path you were given |
| Quote | the smallest thing that carries the disagreement: a status line, a checkbox, half a sentence |
| Counts | count before you state a count. Four subtasks means you resolved four |
| Judgement | `INFERENCE` findings say what would make them false |
| A clean direction B | stated with its numbers, never by silence |
| Edits | never propose one as an instruction. State the disagreement |

## 9. Edge cases

| Case | Do |
|---|---|
| No index in the path | Write the count line and coverage row 0 with the listing, say which file you looked for and that it is not there, then stop. A note with no count line does not read as this skill's report |
| A link you cannot resolve: anchor-only, outside the tracker, an alias like `@root/…` | Skip it. Name it under what you skipped. Do not guess a target |
| An entry stored as a folder, not a file | It counts |
| Link text with an ordering label, for example `010/01 the section loop` | The leading number is a label. Resolve the path |
| An index with no entries, over a folder with no entries | Correct. Report `0 on disk, 0 named` |
| More than 20 findings | Group them. Lead with `MISSING` and `ORPHAN`. Say how many you folded |
