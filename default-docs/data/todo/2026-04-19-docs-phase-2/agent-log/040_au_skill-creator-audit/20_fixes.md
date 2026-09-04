---
title: Verdicts and fixes
---

# Verdicts, one line per finding

Four verdicts: **fix** (this round), **defer** (real, later, named below), **reject** (not a defect), **engine** (fixed in the engine, not the skill). No finding was "not ready". Numbers are the reviewer's.

## Cross-cutting decisions

These apply to every skill. Each fix agent applies them inside its own skill.

- **A. Precedence.** The engine and the CLI are the source of truth for anything they implement: statuses, kinds, templates, commands, flags, what renders. The bundled user guide wins only on convention the code does not enforce. Every skill that states a source-of-truth line says this. Reason: the guide is stale in three verified places (issues 0, issue-logs 2, blog 11), and the old rule told an agent to regress the skill to match it.
- **B. Framework paths.** A skill writes a framework file as `@root/<path>` (`@root` is the framework folder). Never a repo-root-relative path like `astro-doc-code/src/…`, which resolves only in this repo.
- **C. Restarts.** Every "restart the server" instruction says `./start --detach`, with `./start stop` beside it. A foreground `./start` holds the terminal and stalls the agent.
- **D. Child logs** start at `120`. `100` and `110` stay free. `agent-ks-issue-logs` owns this fact; other skills link, they do not restate.
- **E. Logs that open without an ask:** `au`, `rf`, `re`. Ask before `lp`, `it`, `wf`.
- **F. Descriptions.** Take the reviewer's proposed description unless the verdict says otherwise.
- **G. `check links` is removed** from the CLI. `check link-form` is the plugin's link tool. The renderer question belongs to `scripts/checks/check-links.mjs`.
- **H. Reasons on Never rows.** A Never row gets its reason in the "Do instead" cell when the pair does not imply it.
- **I. Word caps.** SKILL.md body under 600 words, frontmatter excluded. A single-file skill with no references is exempt. A reference under 150 lines.

## Deferred, with a home

| Item | From | Home |
|---|---|---|
| Unify usage exit codes to 2 across `issue/*`, `check section`, `move`; make the four validators and `move`/`img` reject unknown flags; add both checks to `_selftest.mjs` | cli 2, 3, 6 | new subtask on this issue |
| A bundled `scripts/scaffold.mjs` for the new-project copy-and-substitute step | config 3 | new subtask on this issue |
| Re-sync the user guide: `19_issues/` (log shape, six kinds, five-section subtask, grouping depth, issue.md size), `18_blogs/04_frontmatter.md`, `02_blogs-index.md`, `16_layout-system/02_switching-styles.md`, `10_configuration/02_env.md`, `data/README.md` | issues 0, 19, 21; issue-logs 2; blog 11; docs note | new subtask on this issue |
| 35 agent logs still carry `01_summary.md`. A migration script, or leave them | index-check 1 | Sid's call |
| The dump issue's subtasks are category buckets, not leaves | quick-idea 5 | Sid's call |
| A sidecar-honesty script for the artifact gate | artifacts, suggestion | later |
| A file's own `NN_` prefix never enters the docs sort tuple (`data.ts` `pathPositionTuple`, the sidebar hook); only `sidebar_position` or 999. Fixing it reorders any sidebar that leaned on the fallback | docs re-audit N1, N2 | Sid's call, engine |
| The blog index caps at ten posts with no pagination | blog re-audit N1 | engine, later |
| `agent-ks move` does not rename a post's `assets/<slug>/` folder | blog re-audit N3 | CLI, later |
| `agent-ks check issues` has no `--scope`, so the closing check prints the whole tracker's warnings | qna re-audit N5 | CLI, later |

## agent-ks-config (10)

| # | Verdict | Note |
|---|---|---|
| 1 | fix | Replace the template tracker `settings.json` with the current schema: no `fields.status`, no `colors`, `descriptions` on every component and label value |
| 2 | fix | `--ignore-existing`, report skipped files, add `.gitignore` and `assets/` to the pre-flight |
| 3 | fix, half | Portable substitutions now: `sed -i.bak … && rm -f *.bak`, `cd … && pwd -P` for the path. The bundled script is deferred |
| 4 | fix | Template `engine_version` = the engine's current version. Add a line to step 8: after the clone, set `engine_version` to the value in `@root/astro-doc-code/src/loaders/engine-version.ts` |
| 5 | fix | |
| 6 | fix | Keep the three cross-cutting Never rows |
| 7 | fix | Ship `assets/template/data/README.md`, one row per shipped section |
| 8 | fix | |
| 9 | fix | Decision C |
| 10 | fix | Three named cases, the merge case as a before/after block |
| 11–17 | fix | |
| 18 | fix | |
| 19 | fix | Decision H |
| 20 | fix | Delete. "Fix it in the framework repo" |
| note | fix, in issues | The issues description tail is the issues agent's |
| cut/add | fix | The `.env.example` line, the `alt:` substitution, `--detach` and `logs` rows. Not the deployment row |

## agent-ks-docs (11)

| # | Verdict | Note |
|---|---|---|
| 1 | fix | Docs-layout says placement only; theme injection is the artifacts skill's, link it. Also closes artifacts 14 |
| 2 | fix | Also fix `data/README.md`? No: deferred with the guide sync. Fix `writing.md:11` |
| 3 | fix | |
| 4 | fix | Scope to a structure task, drop "create it" |
| 5 | fix | |
| 6–13 | fix | 9: drop the count, anchor the link |
| blog 5 | fix here | `writing.md:12` meta-description claim is this file's |
| add | fix | "Run `agent-ks check section` after adding or renaming a page" |

## agent-ks-blog (12)

| # | Verdict | Note |
|---|---|---|
| 1 | fix | Delete the bullet, link `writing.md`'s embedding section |
| 2 | fix | |
| 3 | fix | |
| 4 | fix | |
| 5 | fix | The skill's row. `writing.md:12` is the docs agent's |
| 6 | fix | Decision H |
| 7 | fix | Decision F |
| 8 | fix | |
| 9 | fix | |
| 10 | fix | Five-step sequence plus one complete short post |
| 11 | defer | User guide sync. Do not touch the skill's frontmatter table |
| add | fix | Source-of-truth line per decision A. "File it" points at the tracker: `agent-ks-issues` |

## agent-ks-issues (13)

| # | Verdict | Note |
|---|---|---|
| 0 | fix | Decision A. The guide re-sync is deferred |
| 1 | fix | |
| 2 | fix | |
| 3 | fix | |
| 4 | fix | Decision D. Drop the number from anatomy, link the logs skill |
| 5 | fix | Decision E. Say "ask before `lp`, `it`, `wf`", link the owner for the rest |
| 6 | fix | Delete `08_agent-logs.md`. Move its one sentence into the pickup block. Fix the inbound link in `10_examples.md`. Index-check 5 wants a pointer to `/agent-ks-index-check <path>`; put it in the pickup block and in `07_plans.md` |
| 7 | fix | The four-step pickup block at the top of SKILL.md |
| 8 | fix | Cut "The four boundaries". Shrink duties to two columns |
| 9 | fix | Decision F |
| 10 | fix | Decision F |
| 10a | fix | |
| 11 | fix | |
| 12–18 | fix | |
| 19 | fix, skill side | One level, with the reason. The guide is deferred |
| 20 | fix | Say what is meant |
| 21 | reject | The skill owns `issue.md` sizing. The guide is deferred |

## agent-ks-issue-logs (14)

| # | Verdict | Note |
|---|---|---|
| 1 | engine | Fixed in `issues.ts`: the slot rule now applies only inside an activity. The Status section stays true as written |
| 2 | defer | User guide sync |
| 3 | fix | |
| 4 | fix | |
| 5 | fix | |
| 6 | fix | |
| 7 | fix, in issues | The sibling's description is the issues agent's. This skill takes the proposed description (F) |
| 8 | fix | One row per kind in SKILL.md, the trees move to `references/kinds.md`. SKILL.md then falls under decision I |
| 9 | fix | |
| 10 | fix | Decision H |
| 11–14 | fix | 12: the stub is deleted by the issues agent; nothing to do here. 13: renumber root examples `020_`, `030_`, `040_` |
| CLI note | fix, in cli | `--kind` help gains `re` |
| add | fix | Also: "to check an index against its folder, `/agent-ks-index-check <path>`" in "Before you continue" |

## agent-ks-qna (15)

| # | Verdict | Note |
|---|---|---|
| 1–10 | fix | 9: inline a six-line playback skeleton anyway; it is the only output |
| 11 | fix, by the orchestrator | User guide listing |
| add | fix | The target-issue step, linking `agent-ks-issues` for the no-issue case |

## agent-ks-artifacts (16)

| # | Verdict | Note |
|---|---|---|
| 1–3 | fix | |
| 4 | fix | Decision B |
| 5–13 | fix | 12: the four-word spine above the Triage table |
| 14 | fix, in docs | |
| suggestion | defer | |

## agent-ks-cli (17)

| # | Verdict | Note |
|---|---|---|
| 1 | fix | Decision G. Remove the manifest entry and delete `check-content-links.mjs`. Search every skill for `check links` |
| 2 | fix, doc side | Narrow the row to the truth and name the families. The code change is deferred |
| 3 | fix, doc side | Same |
| 4 | fix | |
| 5 | fix | |
| 6 | fix, doc side | Delete "exit codes" from the sentence. The harness change is deferred |
| 7 | fix | Decision F |
| 8 | fix | Manifest |
| 9–14 | fix | 13: move to `cli-toolkit.md` beside `check skill-links` |
| 15 | fix | `indexUpdated` in the JSON payload |
| 16 | fix | Manifest |
| add | fix | One worked line per scaffolder; the `--report` preconditions |

## agent-ks-quick-idea-note (18)

| # | Verdict | Note |
|---|---|---|
| 1–4 | fix | |
| 5 | fix, one line | "When the dump's subtasks are category buckets, append under the matching heading". The shape decision is Sid's |
| 6–10 | fix | |
| add | fix | All four |

## agent-ks-index-check (19)

| # | Verdict | Note |
|---|---|---|
| 1 | fix | Resolve the log's index leaf by pattern, name the file chosen |
| 2 | fix | `check link-form` first, then the agent for the rest. Add Bash to `allowed-tools` and the agent's `tools` |
| 3 | fix | |
| 4 | fix | Decision F |
| 5 | fix, in issues and issue-logs | |
| 6–7 | fix | |
| 8 | fix | `model: sonnet` |
| 9–18 | fix | |
