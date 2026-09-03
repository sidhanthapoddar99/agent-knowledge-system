---
title: "Skills v2 — the spec for plugins/agent-ks-temp"
---

# Skills v2 — the spec for `plugins/agent-ks-temp`

This file is the spec. Every builder and every reviewer reads it first. It says what
we build, why, the exact tree, the exact rules, and how we check the result.

`plugins/agent-ks` is the current plugin. Do not edit it. Read it. Copy from it.
`plugins/agent-ks-temp` is the new plugin. It replaces the old one in a later release.

## 1. Goal

Make the plugin small, portable and hard to misuse.

- **Small.** Short files. One home per rule. Every other place links to that home.
- **Portable.** Every command is a skill folder. Codex and Claude Code both read skill
  folders. Nothing that matters lives only in a Claude-only file.
- **Hard to misuse.** Validators reject bad data. Scaffolders write the shape. The
  always-loaded `SKILL.md` carries a short table of things never to do. Prose explains;
  it does not enforce.
- **Written in STE.** ASD-STE100 is Simplified Technical English. Short sentences. One
  instruction per sentence. Active voice. One meaning per word. No history.

The trigger for this work. An agent added tick marks to a plan stage's `subtasks:`
list. The rule against that sat in a 12,000-word reference the agent never opened. The
validator did not check the field. The rendered page looked fine. That is the failure
we design against.

## 2. Principles

1. **One home per rule.** A rule is written once. Every other file links to it.
2. **Strength order.** Validator > scaffolder > `SKILL.md` never-table > reference prose.
   Put each rule at the strongest layer that can hold it.
3. **History-free.** A skill describes the current system only. Delete every "used to",
   "earlier version", "no longer", "was retired". Git holds history.
4. **No argument paragraphs.** State the rule. Add at most one sentence of why.
5. **Frontmatter is data.** A field holds only what its schema names. No marks, no
   emoji, no copies of another file's status.
6. **Do not lose a rule.** Every rule in the old files gets a row in a harvest table and
   a home in the new files, or a written reason for dropping it.

## 3. The tree

```
plugins/agent-ks-temp/
├── .claude-plugin/plugin.json            Claude-only manifest
├── LICENSE
├── README.md                             install for Claude Code and for Codex
├── bin/agent-ks, agent-ks.cmd            PATH shims → skills/agent-ks-cli/scripts/cli.mjs
├── agents/agent-ks-index-checker.md      Claude-only shim → skills/agent-ks-index-check/SKILL.md
└── skills/
    ├── agent-ks-cli/
    │   ├── SKILL.md                      the contract, help, exit codes, worktree note
    │   ├── references/
    │   │   ├── cli-toolkit.md            every command and flag
    │   │   └── contract.md               the author contract (was scripts/CONTRACT.md)
    │   ├── templates/                    one skeleton per file type, read by the scaffolders
    │   │   ├── subtask.md
    │   │   ├── plan-overview.md
    │   │   ├── plan-stage.md
    │   │   ├── log-summary.md
    │   │   ├── log-round.md
    │   │   ├── note.md
    │   │   └── comment.md
    │   └── scripts/                      the CLI code (copied from agent-ks-docs/scripts)
    ├── agent-ks-docs/
    │   ├── SKILL.md
    │   └── references/
    │       ├── writing.md                markdown mechanics, the link rule, the ordering label
    │       ├── docs-layout.md            docs sections, prefixes, settings.json, diagram and artifact pages, blog
    │       ├── settings-layout.md        project tree, .env, site.yaml, navbar, footer, aliases, themes
    │       ├── images.md
    │       └── doc-migration.md
    ├── agent-ks-issues/
    │   ├── SKILL.md
    │   └── references/
    │       ├── 01_anatomy.md
    │       ├── 02_lifecycle.md
    │       ├── 03_writing.md
    │       ├── 04_issue-comments-glossary.md
    │       ├── 05_brainstorm-notes-memory.md
    │       ├── 06_subtasks.md
    │       ├── 07_plans.md
    │       ├── 08_agent-logs.md
    │       ├── 09_operations.md
    │       └── 10_examples.md
    ├── agent-ks-artifacts/
    │   ├── SKILL.md
    │   └── references/
    │       ├── design-fundamentals.md
    │       ├── design-systems.md
    │       ├── dataviz.md                the eight dataviz files merged
    │       ├── palette.md
    │       ├── publishing.md
    │       └── PROVENANCE.md             copied byte for byte
    ├── agent-ks-init/
    │   ├── SKILL.md                      was commands/agent-ks-init.md
    │   └── assets/template/              the starter project (was plugin-root template/)
    ├── agent-ks-add-section/SKILL.md     was commands/agent-ks-add-section.md
    ├── agent-ks-quick-idea-note/SKILL.md was commands/agent-ks-quick-idea-note.md
    └── agent-ks-index-check/SKILL.md     was commands/agent-ks-fast-index-check.md + agents/agent-ks-index-checker.md
```

Already in place before the builders start: `bin/`, `LICENSE`, `.claude-plugin/plugin.json`
(unchanged copy), `skills/agent-ks-cli/scripts/` (unchanged copy),
`skills/agent-ks-init/assets/template/` (unchanged copy).

## 4. Ownership

One builder per folder. A builder writes only inside its folder. Cross-links use the
paths in section 3, even when the target does not exist yet.

| Builder | Owns |
|---|---|
| cli | `skills/agent-ks-cli/` and `bin/` |
| docs | `skills/agent-ks-docs/` |
| issues | `skills/agent-ks-issues/` |
| artifacts | `skills/agent-ks-artifacts/` |
| root | `README.md`, `.claude-plugin/`, `agents/`, `skills/agent-ks-init/`, `skills/agent-ks-add-section/`, `skills/agent-ks-quick-idea-note/`, `skills/agent-ks-index-check/` |

## 5. Writing rules — STE

These rules apply to every `.md` file in the new plugin.

- A sentence has at most 20 words. Split a long sentence. Do not delete the words that
  hold it together.
- One instruction per sentence. Write instructions in the imperative: "Write the link."
- Active voice. Present tense.
- One term, one meaning. One name per thing. `01_anatomy.md` holds the glossary. Use
  those names everywhere.
- Define a term where it first appears in a file.
- No idioms. No metaphors. No rhetorical questions. No jokes.
- No history. No "used to", "earlier", "was retired", "no longer", "now".
- State the rule. Then at most one sentence of why.
- A list has at most seven items. Longer lists become tables.
- A table holds rules with three or more facts per row.
- Headings: `#` for the file title, `##` for sections, `###` only where a section has
  sub-parts. Nothing deeper.
- Every reference to a file in this repo is a relative markdown link with text that
  names the target. A backticked path is allowed only for code, config, a binary, or a
  path discussed as a value.
- Numbers go in tables, not in prose, when a reader acts on them.

Size limits:

| File | Limit |
|---|---|
| any `SKILL.md` | 600 words |
| any reference file | 150 lines, 1,500 words |
| any command skill `SKILL.md` | 400 words plus its code blocks |
| a template file | 40 lines |

A file over its limit is a finding for the reviewer. The builder must split content
or cut argument; it must not cut rules.

## 6. The one body template

Every work file uses one body shape. The problem statement comes first with no heading.
Then five `#` sections, numbered. Only `##` under section 05, for indexed points.

```markdown
---
title: "..."
status: open
---

Why this exists: a feature, a bug, an upgrade. What it broke and the impact.

# 01 To Do
- [ ] item
    - [ ] sub-item

# 02 Status and Result
Partial results are fine. Say what is done and what is not.

# 03 References
Links: agent logs, notes, subtasks, docs, external sources, industry practice.

# 04 Decisions
- Decided (author, YYYY-MM-DD): ...

# 05 Notes & Analysis
## 01 First point
## 02 Second point
```

Which files use it:

| File | Sections | Frontmatter |
|---|---|---|
| subtask | all five | `title`, `status` |
| plan `overview.md` | all five | `title` (status lives in the plan's `settings.json`) |
| plan stage | all five | `title`, `status`, `outcome`, `notes`, `who`, `subtasks:` |
| log `01_summary.md` | all five | `title` (status lives in the log's `settings.json`) |
| log round | all five | `title`, `status`, `agent` |
| note | 03, 04, 05 | `title`, optional `color` |
| `issue.md` | keeps its shape: Goal, Context, Done when, Scope decisions | `title` |
| comment | no sections; two lines and a pointer | `author`, `date` |
| brainstorm | free | `title` |

A `subtasks:` entry in a stage is one plain markdown link. Nothing before it. Nothing
after it. The validator errors on anything else.

## 7. Duties — who owns what

| Thing | Owns | Never holds |
|---|---|---|
| Brainstorm | scratch: research, options, dead ends | a conclusion others cite |
| Notes | formal conclusions, things to refer back to | work orders |
| Plan overview | the goal, what goes where, stage order, plan-level decisions and result | subtask detail |
| Plan stage | its subtasks, its result, its decisions, a link to the log that ran it | a copied status |
| Subtask | one work item, full template | when it runs |
| Agent log | what was tried, what came back, what was thrown away, what changed | a restated subtask or plan |
| Agent memory | agent working state: index plus topic files | decisions, the plan |
| Comments | two lines and a pointer | debate |

Results live at three levels, one fact each. A stage's `02` says what the stage
produced. A subtask's `02` says what the item produced. A log's `02` says how the run
went. Never copy a status across levels. The renderer pulls live subtask status into the
stage.

Flow: brainstorm → notes → plan (goal, stages, subtasks) → log (execute) → results
into subtask `02` and stage `02`.

## 8. Agent logs — the new shape

```
agent-log/NNN_<kind>_<name>/
├── settings.json          { "status": "in-progress" }
├── 01_summary.md          the template, all five sections
├── 10_<round>.md          a round, the template, gap-spaced by ten
├── 20_<round>.md
└── 21_<report>.md         a report produced inside round 20; last digit 1–9
```

Rules:

- No `02_working/` folder. No `00_index.md`. No `03_debrief/`. No child logs.
- The summary's `03 References` lists every round with one line of what it found.
- Handover and lessons go in the summary's `02` and `05`. Actionable items become
  subtasks.
- A workflow inside a loop gets its own sibling log. The loop's `03` links to it.
- Kind codes stay: `lp` loop, `au` audit, `rf` refactor, `it` iteration, `wf` workflow,
  plus custom codes from the issue's `settings.json`.
- Runs use five statuses: `open`, `in-progress`, `input-needed`, `done`, `dropped`.

A log exists so a finding can be withdrawn. Open one by work type:

| Work | Record |
|---|---|
| Plan execution | one log per one to three stages. One round per stage or pass |
| Audit or review | one log. Findings in `05`, one line each: file, line, scenario, reproduced, verdict |
| Research, one or many agents | one log. One report file per agent report. Recommendation in `04` |
| Loop or workflow | one log for the loop. One sibling log per workflow with its own goal |
| Large refactor | one log. Rounds: audit, fix, verify |
| Small change, one subtask, one pass | no log. Result in the subtask's `02` |

Size limits:

| File | Limit |
|---|---|
| summary | 60 lines |
| round | 40 lines |
| one finding | one line plus a link |

## 9. The never-table for `agent-ks-issues/SKILL.md`

This table sits in the always-loaded file. Keep the wording. Add rows only with a
reason.

| Never | Do instead |
|---|---|
| Write anything in frontmatter the schema does not name | Body text, or nothing |
| Put a mark, an emoji, or a status before or after a `subtasks:` link | One plain link per entry |
| Set `done` or `dropped` on an issue or a subtask | `review`, `input-needed`, or `superseded` with its `→` line |
| Restate a subtask or a plan inside a log | Link to it |
| Keep old wording next to new wording | Correct in place |
| Search the tracker with `Grep` | `agent-ks issue list` or `agent-ks find` |
| Rename or move with `mv` | `agent-ks move` |
| Write a document path in backticks | A relative markdown link with a name |
| Save a discussion nobody asked to save | Offer once |
| Open a second log for work that belongs to an open one | Append a round |

## 10. Per-builder specs

### cli

Code is already copied. Change it as follows, and change nothing else.

1. Move `scripts/CONTRACT.md` to `references/contract.md`. Fix every link to it.
2. Create `templates/*.md` (section 3). The scaffolders read them at runtime. Delete the
   skeleton strings from the code.
3. `new-subtask` writes `templates/subtask.md`. Keep `--group`, `--title`, `--overview`.
   `--index` stays; the index leaf uses the same template.
4. `new-plan` writes `templates/plan-overview.md`. `new-stage` writes
   `templates/plan-stage.md`.
5. `new-agent-log` writes `settings.json` and `01_summary.md` from
   `templates/log-summary.md`. Remove `--parent`. Remove the index stub and delete
   `_index-stub.mjs`.
6. Add `new-round`. It writes `NN_<name>.md` flat in the log folder from
   `templates/log-round.md`, gap-spaced by ten. `--report` writes the next `N1`–`N9`
   file inside the current round. Keep `new-iteration` as a manifest alias that calls
   `new-round`, so `agent-ks help new-iteration` still resolves.
7. `check issues`:
   - A `subtasks:` entry in a stage must be exactly one markdown link with non-empty text
     and a path that resolves. Anything else is an **error**.
   - Accept both log shapes. Warn on the old shape (`02_working/`, `03_debrief/`,
     `00_index.md`, a child log) with the text "old agent-log shape; migrate".
   - Replace `--subtask-template` with `--template`. It checks the five `#` headings on
     subtasks, stages, plan overviews, log summaries and rounds. Old-shape files warn.
8. `agent-logs` and `show` read flat rounds beside `01_summary.md`.
9. `bun scripts/_selftest.mjs` passes. `bun scripts/cli.mjs check skill-links` passes on
   the temp tree. `bun scripts/cli.mjs help --json` lists `new-round`.
10. `SKILL.md`: the contract, `help`, exit codes, the worktree note, one line per group.
    `references/cli-toolkit.md`: every command and flag, in STE, as tables.

### docs

Five reference files (section 3) plus `SKILL.md`. Rewrite from the current
`plugins/agent-ks/skills/agent-ks-docs/` in STE. Fold `layouts/blog-layout.md` into
`docs-layout.md` as one section. Move the command table out; link to
`../../agent-ks-cli/references/cli-toolkit.md`. `writing.md` stays the one home for the
link rule and the markdown mechanics; the issues skill links to it.

### issues

Ten reference files (section 3) plus `SKILL.md`. Rewrite from the current
`plugins/agent-ks/skills/agent-ks-issues/` in STE. Apply sections 6, 7, 8, 9 of this
spec exactly. `SKILL.md` holds: the one rule, the section table, the four boundaries,
the status table, the never-table, the triage table, and links. Everything else lives in
a reference. `03_writing.md` links to the docs skill's `writing.md` for mechanics and
holds only tracker deltas. `08_agent-logs.md` holds the new shape and the work-type
table; the trigger, floor and fourteen cases are replaced by that table. `10_examples.md`
rewrites the four examples in the new log shape, short.

### artifacts

Six reference files (section 3) plus `SKILL.md`. Rewrite from the current
`plugins/agent-ks/skills/agent-ks-artifacts/` in STE. Merge the eight `dataviz/` files
into `dataviz.md`; if it exceeds the size limit, split into `dataviz.md` and
`dataviz-color.md` and record that in the report. Two hard constraints:

- The inline variable contract in `SKILL.md` §1 is coupled to `theme.yaml`. Keep every
  token name exactly. Do not reword the names.
- `PROVENANCE.md` is copied byte for byte. It is attribution.

### root

- Four command skills. Each `SKILL.md` has frontmatter `name` and `description` and the
  procedure in STE. Keep every step and every check from the old command file.
  `agent-ks-init` finds its template at `assets/template/` next to its own `SKILL.md`;
  drop the `~/.claude/plugins/cache` search and say how to find the path in Claude Code
  (`${CLAUDE_PLUGIN_ROOT}/skills/agent-ks-init/assets/template`) and in Codex (relative
  to the skill folder).
- `agent-ks-index-check/SKILL.md` merges the command and the agent body. It holds the
  whole procedure: the two directions, the four labels, the by-hand fallback.
- `agents/agent-ks-index-checker.md` keeps its frontmatter (`name`, `description`,
  `model: haiku`, `tools`) and a five-line body that says: read and follow
  `../skills/agent-ks-index-check/SKILL.md`.
- `.claude-plugin/plugin.json`: update `description`. Do not bump `version`.
- `README.md`: what the plugin is, install for Claude Code, install for Codex (skills
  folder plus one PATH line for `bin/`), the skill list, the CLI in one paragraph.

## 11. The harvest table

Each prose builder (docs, issues, artifacts, root) writes a harvest table into its
report file in the agent log. One row per rule found in the old files:

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| ... | `path:line` | `file#section` | kept / merged / dropped: reason |

A reviewer reads the old files on their own and looks for rules the table misses.

## 12. Self-check — every builder does this before it reports

1. Re-read every file you wrote against section 5. Fix what fails.
2. Resolve every relative link you wrote. Fix what does not resolve. A link to another
   builder's folder must match section 3 exactly.
3. Count words and lines against the size table. Split or cut argument. Never cut a rule.
4. Grep your folder for history words: `used to`, `earlier`, `retired`, `no longer`,
   `now `. Delete what you find.
5. Check every harvest row has a home or a reason.
6. Write the report file. Then return the structured result.

## 13. Review — how the outputs are judged

One reviewer per builder output. The reviewer reads this spec, the old files, the new
files and the harvest table. It reports findings with a severity, a file and line, and
the fix. Findings:

- **missing**: a rule in the old files with no row and no home.
- **wrong**: a fact that contradicts the code or the framework.
- **style**: a sentence over 20 words, passive voice, history, an argument paragraph.
- **size**: a file over its limit.
- **link**: a relative link that does not resolve.
- **duplicate**: a rule written in two places.

For the cli builder the reviewer runs the code: the self-test, `help --json`, each
scaffolder into the scratch tracker at `plugins/agent-ks-temp/.scratch/todo`, and
`check issues --tracker` against that scratch tracker, including a stage with a marked
`subtasks:` entry that must error.

A rule test runs after the issues skill lands. A fresh agent gets only the new
`agent-ks-issues/SKILL.md` and a scratch issue, and is asked to reorder a stage's
`subtasks:` list. A judge checks the result holds plain links only. The same agent is
asked to add a subtask; the judge checks it used the CLI and the template.

## 14. Out of scope — follow-ups, not this build

- The framework loader and `guide.ts` for the new log shape.
- Migration scripts for existing trackers, the engine version bump, the release note.
- Replacing `plugins/agent-ks` with this tree, and the `agent-ks-dev` shim path.
- Any change to `theme.yaml`.

## 15. Decisions taken

- Templates are files in the cli skill, read at runtime. One source for scaffolder,
  validator and reference.
- Agent logs are flat. No nesting. The link is the structure.
- Plans hold results at stage level. Never a copied status.
- `new-round` replaces `new-iteration`. The old name stays as an alias.
- The link rule and the markdown mechanics live in the docs skill's `writing.md`.
- Commands are skills. The Claude agent file is a shim.
