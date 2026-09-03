---
title: "Commands and root"
status: done
agent: claude
---

# Goal

Builder report: commands-and-root

# Inputs

- [the skills-v2 spec](../../notes/skills-v2-spec.md)

# Expected Outcome

The change, and what it touched.

# Outcome

The root part of spec section 3 is built: four command skills, the agent shim, the manifest description and the README. Every file passed the section 12 self-check twice. One deviation from the tree: the index-check skill carries a `references/procedure.md`, because the full procedure does not fit in 400 words. Spec section 5 sanctions the split. Details below.

## Files

Word counts: "prose" is every token with a letter or a digit, outside the frontmatter and outside fenced code blocks. That is the count the spec's "400 words plus its code blocks" limit reads. The `wc -w` column is the whole file. The counter is `plugins/agent-ks-temp/.scratch/root-check.mjs`.

| File | Lines | Prose words | Limit | wc -w |
|---|---|---|---|---|
| `plugins/agent-ks-temp/skills/agent-ks-init/SKILL.md` | 253 | 399 | 400 | 1374 |
| `plugins/agent-ks-temp/skills/agent-ks-add-section/SKILL.md` | 166 | 395 | 400 | 723 |
| `plugins/agent-ks-temp/skills/agent-ks-quick-idea-note/SKILL.md` | 80 | 399 | 400 | 586 |
| `plugins/agent-ks-temp/skills/agent-ks-index-check/SKILL.md` | 58 | 398 | 400 | 540 |
| `plugins/agent-ks-temp/skills/agent-ks-index-check/references/procedure.md` | 136 | 1241 | 150 lines, 1500 words | 1570 |
| `plugins/agent-ks-temp/agents/agent-ks-index-checker.md` | 14 | 77 (body, five lines) | five-line body | 229 |
| `plugins/agent-ks-temp/README.md` | 70 | 409 | none set | 472 |
| `plugins/agent-ks-temp/.claude-plugin/plugin.json` | 10 | description only | none | version stays 0.8.6 |

Not moved, not edited: `plugins/agent-ks-temp/skills/agent-ks-init/assets/template/`.

## Harvest table

Old paths are relative to `plugins/agent-ks/`. New homes are relative to `plugins/agent-ks-temp/`. Section names are the `##` headings in the new files.

### commands/agent-ks-init.md

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| Copy the bundled template into the chosen folder, then substitute name, title, description, repo URL | `commands/agent-ks-init.md:11` | `skills/agent-ks-init/SKILL.md#intro` | kept |
| The template ships five sections: Home, Docs, Issues, Blog, User Guide; it runs as a site as is | `commands/agent-ks-init.md:13` | `SKILL.md#frontmatter description`, `#5 Confirm the plan` | kept |
| The consumer-mode layout tree | `commands/agent-ks-init.md:15-33` | `SKILL.md#The result` | kept |
| Framework folder sits inside the project root beside `config/` and `data/`; content outside it; `.env` inside it with `CONFIG_DIR=../config` | `commands/agent-ks-init.md:35` | `SKILL.md#The result` (tree comments) | kept |
| A patched `CLAUDE.md` tells later sessions the layout, the skill and the build commands | `commands/agent-ks-init.md:37` | `SKILL.md#The result` | kept |
| Walk the steps in order; ask; confirm before writing; summarise at the end | `commands/agent-ks-init.md:41` | `SKILL.md#intro` | kept |
| Pre-flight: four existence tests; if any prints, stop with the add-section message | `commands/agent-ks-init.md:45-57` | `SKILL.md#1 Pre-flight` | kept; the word "legacy" removed from two labels, the tests stay |
| Locate the template; test `$TEMPLATE_DIR/config`; on failure say the install is broken and name the update command | `commands/agent-ks-init.md:59-69` | `SKILL.md#2 Locate the template` | merged: the cache search is replaced by `${CLAUDE_PLUGIN_ROOT}`, the Codex path, and a derivation from the `agent-ks` shim |
| Scope question; whole repo gives `.`; subfolder asks a name (default `docs`), creates it; print `realpath` before writing | `commands/agent-ks-init.md:71-83` | `SKILL.md#3 Scope` | kept |
| Four identity questions in one message, with defaults; bind `SITE_NAME`, `SITE_TITLE`, `DESCRIPTION`, `REPO_URL` | `commands/agent-ks-init.md:85-100` | `SKILL.md#4 Site identity` | kept |
| Show the plan block and ask "Proceed?" | `commands/agent-ks-init.md:102-125` | `SKILL.md#5 Confirm the plan` | kept |
| rsync without `README.md`; sed substitutions in `site.yaml`, `footer.yaml` (repo URL only when set and not the placeholder, escaped), `home.yaml` | `commands/agent-ks-init.md:127-163` | `SKILL.md#6 Copy and substitute` | kept |
| `.env` is not written here; it belongs in the framework folder, which is created after the clone | `commands/agent-ks-init.md:165`, `:273` | `SKILL.md#6 Copy and substitute` (last paragraph) | merged: two statements, one home |
| `CLAUDE.md`: write the full template if absent; append `## Documentation` if present, merge if one exists; substitute placeholders | `commands/agent-ks-init.md:169`, `:262` | `SKILL.md#7 Patch CLAUDE.md` | kept |
| The `CLAUDE.md` patch is the most important post-init artifact | `commands/agent-ks-init.md:171` | `SKILL.md#7 Patch CLAUDE.md` (one sentence of why) | kept |
| Summary block: clone command, `.env` line, `./start`, open `localhost:4321`, customisation pointers, User Guide note and removal | `commands/agent-ks-init.md:173-202` | `SKILL.md#8 Validate and hand off` | kept; the `./start` comment now states the current behaviour: install when missing, then dev; no build |
| The `CLAUDE.md` template: layout, build commands, `.env` note, tooling, install lines, adding content, validate before commit | `commands/agent-ks-init.md:206-260` | `SKILL.md#The CLAUDE.md template` | kept; build commands, the skill list and the command list updated to the current framework and plugin |
| Ask one question at a time when needed; batch related ones | `commands/agent-ks-init.md:268` | `SKILL.md#3 Scope`, `#4 Site identity` | kept |
| Show the file plan before writing; never scaffold in silence | `commands/agent-ks-init.md:269` | `SKILL.md#5 Confirm the plan` | kept |
| Restate a non-default answer so the user can correct a typo | `commands/agent-ks-init.md:270` | `SKILL.md#4 Site identity` | kept |
| After scaffolding run `agent-ks check config` with the explicit config path; must exit clean; else fix or report | `commands/agent-ks-init.md:271` | `SKILL.md#8 Validate and hand off` | kept |
| Do not clone the framework for the user; print the command | `commands/agent-ks-init.md:272` | `SKILL.md#8 Validate and hand off` | kept |
| The template's `README.md` is excluded because it documents the template | `commands/agent-ks-init.md:132` | `SKILL.md#6 Copy and substitute` (code comment) | kept |
| Frontmatter: description, allowed-tools, argument-hint | `commands/agent-ks-init.md:2-4` | `SKILL.md` frontmatter, plus `name` | kept |

### commands/agent-ks-add-section.md

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| A section is a folder under `data/` mapped to a route by `pages:` in `site.yaml`; the output tree and the yaml entry | `commands/agent-ks-add-section.md:11-31` | `skills/agent-ks-add-section/SKILL.md#intro` | kept |
| The section folder is plain kebab-case, no `NN_` prefix; the prefix is for files and subfolders inside; explain when asked | `commands/agent-ks-add-section.md:33`, `:190` | `SKILL.md#intro` | merged |
| Resolve the root: walk up for `config/site.yaml`, else `default-docs/config/site.yaml`; stop message; root and data root; state the paths | `commands/agent-ks-add-section.md:37-53` | `SKILL.md#1 Resolve the project root` | kept; "legacy" renamed "framework-dev layout" |
| Name from `$ARGUMENTS` else ask; regex; collision via `ls`; near miss normalised and confirmed; invalid explained and re-asked | `commands/agent-ks-add-section.md:55-66` | `SKILL.md#2 Get the section name` | kept |
| Title Case label with examples; confirm | `commands/agent-ks-add-section.md:68-77` | `SKILL.md#3 Compute the label` | kept |
| Ask about `site.yaml`; two options; default yes | `commands/agent-ks-add-section.md:79-88` | `SKILL.md#4 Ask about site.yaml` | kept |
| Show the plan; omit the yaml block on no; wait for confirmation | `commands/agent-ks-add-section.md:90-111` | `SKILL.md#5 Confirm the plan` | kept |
| Templates: `settings.json`, `01_overview.md`, the `site.yaml` append with matching indentation, never reformat | `commands/agent-ks-add-section.md:113-161` | `SKILL.md#6 Templates` | kept; the `settings.json` shape checked against the loader (`sidebar` block) and the repo's real section roots |
| Validate: `check section` exit 0; `check config` when `site.yaml` changed; on failure show and offer a fix; else the "Created section" block | `commands/agent-ks-add-section.md:163-182` | `SKILL.md#7 Validate and report` | kept |
| Validate the name before other questions; stop early on a collision | `commands/agent-ks-add-section.md:188` | `SKILL.md#2 Get the section name` | kept |
| Never overwrite an existing `settings.json` or `site.yaml` block; stop and ask | `commands/agent-ks-add-section.md:189` | `SKILL.md#6 Templates` (first line) | kept |
| Frontmatter | `commands/agent-ks-add-section.md:2-4` | `SKILL.md` frontmatter | kept |

### commands/agent-ks-quick-idea-note.md

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| One subtask in the right dump issue; no folder; no bare dump, context sentences | `commands/agent-ks-quick-idea-note.md:11-14` | `skills/agent-ks-quick-idea-note/SKILL.md#intro`, `#4 Write the entry` | kept |
| Background: the creation threshold; the dump is for the unhomed; dump issues carry `issue-dump`; entry is a subtask; graduation promotes and deletes, never ticks | `commands/agent-ks-quick-idea-note.md:16-22` | link to `skills/agent-ks-issues/references/09_operations.md` (The dump); `SKILL.md#4` (the To Do line); `#Never` | merged: the home is the issues skill; this file links to it |
| Idea from `$ARGUMENTS` else ask | `commands/agent-ks-quick-idea-note.md:25-29` | `SKILL.md#1 Get the idea` | kept |
| Route: one search; strong match goes to that issue as a subtask, stop; passes the threshold, offer a real issue; else dump. One search, one judgement | `commands/agent-ks-quick-idea-note.md:31-47` | `SKILL.md#2 Route it` | kept |
| Pick the dump issue: list by component; one, several, none; create the first with component, low priority and a contract `issue.md`; add the vocabulary value with a comment | `commands/agent-ks-quick-idea-note.md:49-65` | `SKILL.md#3 Pick the dump issue` | kept |
| Write the entry: next gap-spaced prefix; frontmatter; two or three context sentences; the graduation line; keep the user's words | `commands/agent-ks-quick-idea-note.md:67-89` | `SKILL.md#4 Write the entry` | merged: `new-subtask` writes the prefix and the template; `state: open` corrected to `status: open` by the template |
| Confirm with one line | `commands/agent-ks-quick-idea-note.md:91-97` | `SKILL.md#5 Confirm` | kept |
| No validation for one subtask write; `check issues` only when settings changed | `commands/agent-ks-quick-idea-note.md:99-100` | `SKILL.md#5 Confirm` | kept |
| Speed: one search, one write, one line; do not ask about priority, labels, components | `commands/agent-ks-quick-idea-note.md:104-106` | `SKILL.md#intro`, `#Never` | kept |
| Never create an issue folder for the idea; only the first dump issue, with consent | `commands/agent-ks-quick-idea-note.md:107-109` | `SKILL.md#3`, `#Never` | kept |
| Do not tick off or delete existing dump entries here | `commands/agent-ks-quick-idea-note.md:110-111` | `SKILL.md#Never` | kept |
| A bug report with an obvious home is routed there | `commands/agent-ks-quick-idea-note.md:112-113` | `SKILL.md#2 Route it` (row 1) | kept |
| Frontmatter | `commands/agent-ks-quick-idea-note.md:2-4` | `SKILL.md` frontmatter | kept |

### commands/agent-ks-fast-index-check.md

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| Hand the path to the subagent and relay; nothing is edited | `commands/agent-ks-fast-index-check.md:12-14` | `skills/agent-ks-index-check/SKILL.md#intro`, `#Run it` | kept |
| Path from `$ARGUMENTS`; ask when empty; resolve a relative path against cwd | `commands/agent-ks-fast-index-check.md:18-24` | `SKILL.md#Run it` | kept |
| Do not read the index before the dispatch; one `Glob` or `Read` to confirm existence at most | `commands/agent-ks-fast-index-check.md:26-28` | `SKILL.md#Run it` | kept |
| Dispatch via `Agent` (`Task`); namespaced type with bare fallback; foreground; prompt is path plus scope; do not restate the procedure | `commands/agent-ks-fast-index-check.md:32-40` | `SKILL.md#Run it` | kept; the prompt also carries the absolute path of the skill file |
| Relay the report: findings, paths, what was read and skipped | `commands/agent-ks-fast-index-check.md:44-45` | `SKILL.md#Relay` | kept |
| Keep the two directions apart; `MISSING` at the top; the four labels | `commands/agent-ks-fast-index-check.md:47-58` | `SKILL.md#The two directions`, `#The four labels`, `#Relay` | kept |
| Relay the `MISSING` count even at zero, with numbers | `commands/agent-ks-fast-index-check.md:60-63` | `SKILL.md#Relay` | kept |
| A clean report: say so with what was checked | `commands/agent-ks-fast-index-check.md:65-66` | `SKILL.md#Relay` | kept |
| Report only; do not fix or offer to | `commands/agent-ks-fast-index-check.md:68-71` | `SKILL.md#Never` | kept |
| Never set a status from a finding; `done` and `dropped` are the user's; a stage may run ahead of its subtasks | `commands/agent-ks-fast-index-check.md:72-75` | `SKILL.md#Never`; `references/procedure.md#6 The plan case` (caveat) | kept |
| Manual; never a hook, gate or CI job | `commands/agent-ks-fast-index-check.md:76-78` | `SKILL.md#Never` | kept |
| Frontmatter: argument-hint, allowed-tools | `commands/agent-ks-fast-index-check.md:2-4` | `SKILL.md` frontmatter; `Grep` added for the by-hand listing fallback | kept |

### agents/agent-ks-index-checker.md

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| Frontmatter: name, description with triggers, model haiku, color cyan, tools `[Read, Grep, Glob]` | `agents/agent-ks-index-checker.md:1-7` | `agents/agent-ks-index-checker.md` frontmatter | kept; description rewritten for the flat log shape, in short sentences |
| An index is a claim about files elsewhere; it goes stale in silence; find where they disagree | `agents/agent-ks-index-checker.md:9-15` | `skills/agent-ks-index-check/SKILL.md#intro` | kept |
| No write tool; report, the caller decides; never propose an edit as an instruction | `agents/agent-ks-index-checker.md:17-21` | `SKILL.md#Never`; `references/procedure.md#8 Quality` (Edits row) | kept |
| When to invoke: four scenarios; never from a hook, gate, validator or CI job | `agents/agent-ks-index-checker.md:23-37` | agent description; `SKILL.md#Never` | kept |
| The filesystem is the truth; list before reading the index; run twice in opposite directions; report separately | `agents/agent-ks-index-checker.md:39-45` | `SKILL.md#The two directions`; `procedure.md#2 List the folder first` | kept |
| Direction A and B: what each asks and finds | `agents/agent-ks-index-checker.md:47-56` | `SKILL.md#The two directions` | kept |
| Direction B is invisible to A; a run with no listing has not run B and must say so | `agents/agent-ks-index-checker.md:58-74` | `SKILL.md#The two directions` | kept; the worked example dropped as argument |
| Resolve the path: six kinds of input; a missing path stops the run | `agents/agent-ks-index-checker.md:78-90` | `procedure.md#1 Resolve the path` | kept; the agent-log row rewritten for the flat shape |
| List two levels deep; `Grep` fallback; "could not list" is not a result; say which tool; write the listing out; per-kind listing table; unnamed is `MISSING` | `agents/agent-ks-index-checker.md:92-115` | `procedure.md#2 List the folder first` | kept; `ls` added for a shell-only host |
| Read the index; every link counts; read target frontmatter; full read only for prose claims; resolving proves existence only | `agents/agent-ks-index-checker.md:117-126` | `procedure.md#3 Read the index and resolve every link` | kept |
| Diff: B strikes off file by file; A gives `ORPHAN` and `STALE`, prose state claims and unticked boxes included | `agents/agent-ks-index-checker.md:128-139` | `procedure.md#4 Diff both directions` | kept |
| The six kinds table | `agents/agent-ks-index-checker.md:143-155` | `procedure.md#5 The kinds` | merged: the `00_index.md` row and the summary-todo row became the two `01_summary.md` rows (`03 References`, `01 To Do`) |
| The plan case: five mandatory checks with labels; answer all by name | `agents/agent-ks-index-checker.md:157-191` | `procedure.md#6 The plan case` | kept; `## Todo` became `01 To Do`, `## Outcome` became `02 Status and Result` |
| An index that explains why it is stale is still stale; checks 2 to 5 compare two files | `agents/agent-ks-index-checker.md:193-199` | `procedure.md#6 The plan case` | kept |
| Caveat for check 1 only: stage status is the schedule; not extended to 2 to 5 | `agents/agent-ks-index-checker.md:201-207` | `procedure.md#6 The plan case` | kept |
| Output: findings first, then the header count; count and verdict; split by direction; B first with numbers even when empty; format block | `agents/agent-ks-index-checker.md:209-239` | `procedure.md#7 The report` | kept |
| The four labels with direction | `agents/agent-ks-index-checker.md:241-248` | `SKILL.md#The four labels` | kept |
| Coverage table with evidence; run every row; `not run` with reason; row 0 fixed with two numbers; plan rows 0 to 4; row 0 never `n/a`; one table at the end | `agents/agent-ks-index-checker.md:250-287` | `procedure.md#7 The report` | kept |
| Finish with what you read, as counts; name what was not reached; a clean result is an answer; no manufactured findings | `agents/agent-ks-index-checker.md:289-295` | `procedure.md#7 The report` | kept |
| Quality: both sides and both paths; relative paths; smallest quote; count before stating; judgement labelled; clean B with numbers | `agents/agent-ks-index-checker.md:297-309` | `procedure.md#8 Quality` | kept |
| Edge cases: no index; unresolvable link; folder entry; ordering label; empty index; non-entry files; over 20 findings | `agents/agent-ks-index-checker.md:311-329` | `procedure.md#9 Edge cases`; non-entry files in `#2` | kept |

### README.md and plugin.json

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| Install through the marketplace, three lines | `README.md:14-20` | `README.md#Install for Claude Code` | kept |
| `bin/` is on PATH at session start; bash and `.cmd` shims; try commands | `README.md:22-30` | `README.md#Install for Claude Code`, `#The CLI` | kept |
| Skills trigger on their domain in a framework-shaped project | `README.md:32` | `README.md#The skills` (Invoke column) | kept |
| Bootstrap with `/agent-ks-init`; add a section with `/agent-ks-add-section` | `README.md:34-50` | `README.md#The skills` | merged; "computes the next `NN_` prefix" dropped as wrong |
| What is inside: the capability table | `README.md:52-63` | `README.md#The skills`, `#The CLI` | merged |
| Requirements: a framework-shaped project; bun | `README.md:65-68` | `README.md#Requirements` | kept; the node fallback dropped as wrong |
| License | `README.md:70-72` | `README.md#License` | replaced: MIT, the `LICENSE` file exists |
| Manifest description | `.claude-plugin/plugin.json:3` | `.claude-plugin/plugin.json` | rewritten for the new shape; `version` unchanged |
| Codex install: skills folder, one PATH line, bun required | brief (new) | `README.md#Install for Codex` | new, per the brief; path read from the codex 0.149.1 binary: `$CODEX_HOME/skills`, default `~/.codex/skills` |

Rows: 79. Every row has a home or a reason.

## Self-check (spec section 12)

| Check | Result |
|---|---|
| 1. Re-read against section 5 | Done twice. Fixed on the second pass: five idioms ("last resort", "is the ceiling", "does not get to argue", "cold reader", "is the feature"), two passive "is fixed" phrasings, one history word inside the report-format block ("no longer hold"), an example in link form inside an edge-case cell |
| 2. Links | 18 relative links across my files. 16 resolve. 2 in `README.md` point at `skills/agent-ks-cli/SKILL.md`, a spec section 3 path the cli builder owns and has not written yet. `agent-ks check skill-links` on the temp tree reports the same two, and nothing else in my files |
| 3. Sizes | All within limit; see the file table. First pass was over on four files (537, 416, 546, 486); cut duplicates and "why" clauses that already live in the procedure reference; no rule cut |
| 4. History words | Grep for `used to`, `earlier`, `retired`, `no longer`, `now`, `former`, `legacy`, `previously`: 0 hits |
| 5. Harvest | 79 rows; each has a home or a reason |
| Sentences over 20 words | 0 across all seven files, frontmatter descriptions included |
| `plugin.json` | parses; `version` is `0.8.6`, unchanged |
| Facts checked against code | `agent-ks check config <template>/config` exit 0; `agent-ks check section <template>/data/docs` exit 0; `new-subtask --overview` writes the lead paragraph (`new-subtask.mjs:7`, `:103`); section-root `settings.json` shape matches `loadSettings()` in `data.ts:386` and the repo's real section roots; `./start` behaviour from `./start --help` and `start.mjs`; the Codex skills path from the `codex` binary |

## Dropped rules, with reasons

| Dropped | Reason |
|---|---|
| The `~/.claude/plugins/cache` search in init step 2 | Spec section 10 says drop it |
| The old agent's worked example: rounds 010 to 060 listed, 070 and 080 written later | Argument paragraph; the rule (list the directory, or direction B did not run) stays |
| The old agent's `02_working/00_index.md` kind | The flat log shape has no index file; the summary's `03 References` is the round index (spec section 8) |
| "the exact blind spot that certified a wrong index before" | History; the rule (a folder entry counts) stays |
| The word "legacy" on two pre-flight labels and the add-section fallback | History word; the checks stay, renamed "framework-dev layout" |
| init: `./start` described as "preflight: pick bun (else npm), install, sanity build, dev" | Wrong against `start.mjs`: dev installs when missing and never builds |
| README: add-section "computes the next `NN_` prefix" | Wrong: a top-level section carries no prefix, as the command itself says |
| README: "npm / node work as fallbacks" | Wrong: `bin/agent-ks` refuses to run without bun |
| README: "License TBD" | The `LICENSE` file exists (MIT) |
| The ✅ emoji in the init summary block | STE; no emoji |

## Decisions taken

- The index-check skill is split: `SKILL.md` (flow, two directions, four labels, by-hand fallback, relay, never-table) plus `references/procedure.md` (path kinds, listing, diff, kinds table, plan checks, report format, quality, edge cases). Spec section 5 says split when over the limit and never cut rules.
- The dispatch prompt carries the absolute path of the skill file, so the haiku agent can read it whether or not `${CLAUDE_PLUGIN_ROOT}` expands inside agent markdown. The agent body also names the `${CLAUDE_PLUGIN_ROOT}` form.
- The init skill locates the template three ways: `${CLAUDE_PLUGIN_ROOT}`, the Codex skill folder, and a derivation from `command -v agent-ks`. The config test from the old file stays.
- quick-idea-note scaffolds with `agent-ks issue new-subtask --overview`, so the scaffolder writes the shape (spec principle 2). The graduation line becomes the one `01 To Do` item.
- Skill frontmatter keeps `argument-hint` and `allowed-tools` from the old commands, plus `name`. Codex ignores unknown keys.
- The agent shim keeps `color: cyan`. "Keeps its frontmatter" read as all five keys.

## Open questions

1. The `references/procedure.md` file is not in the spec section 3 tree. Reviewer to confirm the split, or to name what to cut.
2. `${CLAUDE_PLUGIN_ROOT}` expansion inside skill and agent markdown is not verified in this session. Both places carry a fallback.
3. The starter template's `data/docs/settings.json` uses `isCollapsible`, a key `loadSettings()` does not read (it reads `sidebar.collapsible`). The template is an unchanged copy and was not touched. The repo's own `default-docs/data/user-guide/05_getting-started/settings.json` has the same key. Out of scope here; worth a subtask.
4. `disable-model-invocation: true` for `agent-ks-init` was considered and not added. It would stop the model from firing a whole-project scaffold on a weak signal. A behaviour change the brief did not ask for.
5. The README's Codex step 1 symlinks every skill folder, `agent-ks-cli` included. The CLI skill's `scripts/` ride along; harmless, and the templates are needed by the scaffolders.
