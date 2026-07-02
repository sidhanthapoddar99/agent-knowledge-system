# Issue tracker — overview & entry point

How to read, write, and navigate any issue tracker in this project. The default
tracker lives at `data/todo/`; a project may have multiple trackers, all following
this same shape.

This reference is **split into focused files** so a narrow task ("how do I add a
comment?") reads one ~60–150 line file instead of the whole reference. **Start
here**, then drill into the sibling you need (index below).

**Canonical source of truth:** the framework's bundled
`@root/default-docs/data/user-guide/19_issues/` — read those pages when this
reference is unclear or you need depth this folder doesn't cover.

---

## Operating model — what this tracker is

The tracker is **comprehensive memory of thought-work for AI-augmented development**,
not a project-management tool. An issue is a folder that captures one coherent unit
of *thinking + execution*. The value is the recorded reasoning, not "what's left to
do".

The natural flow inside an issue (no required order — sections are organized by what
they *hold*): **deliberate** (`brainstorm/`) → **write down** (`notes/`) → **plan**
(`subtasks/`) → **execute** (`agent-log/`). `comments/` is the flat evolution log of
the issue itself; `agent-memory/` is the AI's always-on, issue-scoped working state.
Subtasks are the AI-handoff units — each one an explicit "did this happen yet?"
checkbox the next agent (or human reviewer) can pick up cold.

**Ordering is `priority` desc, then recency (`updated`) desc. Recency is derived from
git** (most recent commit touching any file under the issue folder). `created` comes
from the folder slug. Transient execution state (actively-working, stuck) is now carried
by the **status** itself — `in-progress`, `blocked`, `input-needed` — not by a label; the
old `wip` label is deprecated in place.

**Best-practice rules** (convention, not enforcement):
- **One component per issue.** Multi-component is allowed for genuinely cross-cutting
  work but is the exception. When tempted to list two, ask "should this be two
  issues?" — usually yes.
- **AI-handoff-bound issues declare ≥1 subtask.** The subtask is the handoff anchor.
- **The creation litmus test:** a thought earns a full issue only if you can name its
  component and its first subtask in one breath — otherwise it's a subtask on an
  existing issue, a brainstorm entry, or a dump entry. Full rules:
  [42_updating.md](../40_operations/42_updating.md).

**Don't add scheduling, release-bucket, or single-type fields without an explicit
policy reversal.** This tracker treats those as project-management primitives that
rot under continuous AI-driven shipping.

---

## Lifecycle — 7 statuses, 4 categories & AI rules

**7 statuses in 4 categories**, shared by issue `status` and subtask `status` (one field,
one vocabulary — both fixed in framework code):

| Category | Statuses | Notes |
|---|---|---|
| **Not Started** | `open` · `blocked` | `blocked` = depends on another issue/subtask; reason in prose |
| **In Progress** | `in-progress` | Agent sets it automatically when work starts |
| **Review** | `input-needed` · `review` | `input-needed` = stuck on a question (written inline); `review` = done, awaiting sign-off |
| **Closed** | `done` · `dropped` | Terminal; both **human-only**; `dropped` needs a comment first |

Transitions are **unenforced** — any jump is legal. The category grouping is what the UI
filters by; the status is the per-row badge.

### AI rules — the most important rules in the whole skill

1. **Manage `in-progress`; hand off at Review; never mark `done`/`dropped`.** Set
   `in-progress` when you start executing. Your ceiling is `review` (or `input-needed`) —
   `done`/`dropped` are *human-only*. The human inspects the artefact (PR, diff,
   screenshot) and flips to `done`.

2. **Hit a wall → `input-needed`, not `blocked`.** Set `input-needed` and write the
   actual question **inline in the subtask/issue body** so a fresh session picks it up.
   Reserve `blocked` for a structural dependency on another issue/subtask (named in prose).

3. **Default search scope is everything not Closed** (`open`, `blocked`, `in-progress`,
   `input-needed`, `review`). When the user asks an open-ended question ("what's in
   progress?", "what needs review?"), skip the Closed category (`done`/`dropped`) unless
   the prompt explicitly asks for closed history.

4. **Subtask review-debt promotion.** An active (non-closed) issue with **any** subtask in
   the **Review category** (`review` or `input-needed`) is treated as review-gated —
   surface it under "needs review". `blocked` and other resting states don't promote —
   their reason sits in a comment or `issue.md` for whoever opens the issue.

5. **Mark `review` only when:** implementation is done from your perspective, all subtasks
   are `review`/`done`, there's a verifiable artefact (PR, file diff, screenshot, test
   output), and the agent-log captures what was tried.

6. **`dropped` requires a comment** (human-only). Write `comments/NNN_….md` explaining why
   before flipping.

---

## Where to find what

Read **only the file(s) you need** — each is self-contained.

Files live in five band folders — the folder listing itself reads as this table of
contents.

| File | Read it for |
|---|---|
| **`00_anatomy/` — orientation** | |
| [00_overview.md](00_overview.md) | *(this file)* operating model, lifecycle + AI rules, this index |
| [01_folder-layout.md](01_folder-layout.md) | the `<issue>/` folder tree, the 2-level rule, URL shapes |
| [02_per-issue-settings.md](02_per-issue-settings.md) | per-issue `settings.json`; derived vs stored; `agentLogKinds` |
| [03_overall-issue-tracker-vocabulary.md](03_overall-issue-tracker-vocabulary.md) | the tracker-root `settings.json(c)` — `fields` vocabulary, authors, views |
| **`10_writing/` — writing inside issues** | |
| [10_writing.md](../10_writing/10_writing.md) | writing markdown inside issues — frontmatter, tags, diagrams, assets, linking |
| **`20_sections/` — sub-document types** | |
| [20_issue-md.md](../20_sections/20_issue-md.md) | `issue.md` — the goal/context body |
| [21_comments.md](../20_sections/21_comments.md) | comments — flat evolution log, **+ add-a-comment recipe** |
| [22_notes.md](../20_sections/22_notes.md) | notes — finalized output, **+ add-a-note recipe** |
| [23_subtasks.md](../20_sections/23_subtasks.md) | subtasks — numbering, groups, statuses, **+ create/update recipes** |
| [24_agent-logs.md](../20_sections/24_agent-logs.md) | agent-log — **activity folders**, kinds, milestones, **+ add-entry recipe** |
| [25_brainstorm.md](../20_sections/25_brainstorm.md) | brainstorm — kinds, threads, the graduation marker |
| [26_agent-memory.md](../20_sections/26_agent-memory.md) | agent-memory — index + topic files, always-on rules |
| [27_guide-and-glossary.md](../20_sections/27_guide-and-glossary.md) | the Guide panel + per-issue `glossary.md` |
| **`40_operations/` — tools / activity** | |
| [41_searching.md](../40_operations/41_searching.md) | search scope, the no-`Grep` rule, subagent patterns |
| [42_updating.md](../40_operations/42_updating.md) | creation rules (litmus test, dump), duplicate-check, validating |
| [43_moving-restructuring.md](../40_operations/43_moving-restructuring.md) | `docs-guide move` + promoting/splitting/merging issues |
| **`60_examples/` — worked examples** | |
| [61_multiple-subtasks.md](../60_examples/61_multiple-subtasks.md) | a standard implementation issue with several subtasks |
| [62_research-focused.md](../60_examples/62_research-focused.md) | a research/design issue — heavy deliberation, few code subtasks |
| [63_agent-loops.md](../60_examples/63_agent-loops.md) | an issue worked across many agent-log iterations |
| [64_phase-index.md](../60_examples/64_phase-index.md) | the phase / index issue — subtasks promoted to their own issues |

---

## Cross-references

- `@root/default-docs/data/user-guide/19_issues/` — the canonical user-guide section
- `…/19_issues/02_design-philosophy.md` — why the tracker is shaped this way
- `…/19_issues/04_setup/06_lifecycle-and-review.md` — deep dive on the seven-status / four-category model
- `…/19_issues/09_using-with-ai.md` — agent-facing rules
- For docs / blog / config work outside the tracker: the **`documentation-guide`** skill
