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

**Ordering signals are `priority` + `status`. Recency is derived from git** (most
recent commit touching any file under the issue folder). `created` comes from the
folder slug. Transient state (actively-working-on, stuck) is a **label**, not a
status.

**Best-practice rules** (convention, not enforcement):
- **One component per issue.** Multi-component is allowed for genuinely cross-cutting
  work but is the exception. When tempted to list two, ask "should this be two
  issues?" — usually yes.
- **AI-handoff-bound issues declare ≥1 subtask.** The subtask is the handoff anchor.
- **The creation litmus test:** a thought earns a full issue only if you can name its
  component and its first subtask in one breath — otherwise it's a subtask on an
  existing issue, a brainstorm entry, or a dump entry. Full rules:
  [42_updating.md](42_updating.md).

**Don't add scheduling, release-bucket, or single-type fields without an explicit
policy reversal.** This tracker treats those as project-management primitives that
rot under continuous AI-driven shipping.

---

## Lifecycle — the 4 states & AI rules

States: `open` → `review` → `closed` | `cancelled` — shared by issue `status` and
subtask `state`.

| From | Allowed transitions | Notes |
|---|---|---|
| `open` | → `review`, → `cancelled` | Most common forward path is `open → review` |
| `review` | → `open`, → `closed` | `review → open` if pushback in a comment |
| `closed` | (terminal) | Generally don't reopen — file a new issue |
| `cancelled` | (terminal) | Always paired with a comment explaining why |

### AI rules — the most important rules in the whole skill

1. **Always mark `review`, never `closed` directly.** `closed` is a *human-only*
   transition in autonomous mode. The agent's job ends at `review` — the human
   inspects the artefact (PR, file diff, screenshot) and flips to `closed`.

2. **Default search scope is `open` + `review`.** When the user asks an open-ended
   question about issues ("what's blocked?", "what needs review?"), search **only**
   `open` and `review` items unless the prompt explicitly asks for closed history.

3. **Subtask review-debt promotion.** An `open` issue with **any** `review`-state
   subtask is treated as review-gated — surface it under "needs review". (This is a
   `review`-only special case: `review` is an actionable item for the human.
   Blocked-style resting states don't promote — their reason just sits in a comment
   or `issue.md` for whoever opens the issue.)

4. **Mark `review` only when:** implementation is done from your perspective, all
   subtasks are `review`/`closed`, there's a verifiable artefact (PR, file diff,
   screenshot, test output), and the agent-log captures what was tried.

5. **`cancelled` requires a comment.** Write `comments/NNN_….md` explaining why
   before flipping.

---

## Where to find what

Read **only the file(s) you need** — each is self-contained.

| File | Read it for |
|---|---|
| **Part 1 — Overall** | |
| [00_overview.md](00_overview.md) | *(this file)* operating model, lifecycle + AI rules, this index |
| [01_folder-layout.md](01_folder-layout.md) | the `<issue>/` folder tree, the 2-level rule, URL shapes |
| [02_settings.md](02_settings.md) | per-issue `settings.json`; derived vs stored; `agentLogKinds` |
| [03_vocabulary.md](03_vocabulary.md) | the tracker-root `settings.json(c)` — `fields` vocabulary, authors, views |
| [10_writing.md](10_writing.md) | writing markdown inside issues — frontmatter, tags, diagrams, assets, linking |
| **Part 2 — Content (sub-document types)** | |
| [20_issue-md.md](20_issue-md.md) | `issue.md` — the goal/context body |
| [21_comments.md](21_comments.md) | comments — flat evolution log, **+ add-a-comment recipe** |
| [22_notes.md](22_notes.md) | notes — finalized output, **+ add-a-note recipe** |
| [23_subtasks.md](23_subtasks.md) | subtasks — numbering, groups, states, **+ create/update recipes** |
| [24_agent-logs.md](24_agent-logs.md) | agent-log — **activity folders**, kinds, milestones, **+ add-entry recipe** |
| [25_brainstorm.md](25_brainstorm.md) | brainstorm — kinds, threads, the graduation marker |
| [26_agent-memory.md](26_agent-memory.md) | agent-memory — index + topic files, always-on rules |
| [27_guide-and-glossary.md](27_guide-and-glossary.md) | the Guide panel + per-issue `glossary.md` |
| **Part 3 — Tools / activity** | |
| [41_searching.md](41_searching.md) | search scope, the no-`Grep` rule, subagent patterns |
| [42_updating.md](42_updating.md) | creation rules (litmus test, dump), duplicate-check, validating |
| [43_moving-restructuring.md](43_moving-restructuring.md) | `docs-guide move` + promoting/splitting/merging issues |
| **Part 4 — Examples** | |
| [61_multiple-subtasks.md](61_multiple-subtasks.md) | a standard implementation issue with several subtasks |
| [62_research-focused.md](62_research-focused.md) | a research/design issue — heavy deliberation, few code subtasks |
| [63_agent-loops.md](63_agent-loops.md) | an issue worked across many agent-log iterations |
| [64_phase-index.md](64_phase-index.md) | the phase / index issue — subtasks promoted to their own issues |

---

## Cross-references

- `@root/default-docs/data/user-guide/19_issues/` — the canonical user-guide section
- `…/19_issues/02_design-philosophy.md` — why the tracker is shaped this way
- `…/19_issues/04_setup/06_lifecycle-and-review.md` — deep dive on the 4-state model
- `…/19_issues/09_using-with-ai.md` — agent-facing rules
- For docs / blog / config work outside the tracker: the **`documentation-guide`** skill
