# Issue tracker — overview & entry point

How to read, write, and navigate any issue tracker in this project. The default tracker lives at `data/todo/`; a project may have multiple trackers, all following this same shape.

This reference is **split into focused files** so a narrow task ("how do I add a comment?") reads one ~60–150 line file instead of the whole reference. **Start here**, then drill into the one sibling you need (index below).

**Canonical source of truth:** the framework's bundled `@root/default-docs/data/user-guide/19_issues/` — read those pages when this reference is unclear or you need depth this folder doesn't cover.

---

## Operating model — what this tracker is

The tracker is **comprehensive memory of thought-work for AI-augmented development**, not a project-management tool. An issue is a folder that captures one coherent unit of *thinking + execution*: planning notes, work breakdown, agent execution log, dialog. The value is the recorded reasoning, not "what's left to do".

The flow inside an issue: **planning** (`issue.md` + `notes/`) → **execution** (`agent-log/`) → **dialog** (`comments/`). Subtasks are the AI-handoff units inside that flow — each subtask is one explicit "did this happen yet?" checkbox the next agent (or human reviewer) can pick up cold.

**Ordering signals are `priority` + `status`. Recency is derived from git** (most recent commit touching any file under the issue folder). `created` comes from the folder slug. Transient state (actively-working-on, stuck) is a **label**, not a status.

**Best-practice rules** (convention, not enforcement):
- **One component per issue** — always. Pick the single component the issue most belongs to; even genuinely cross-cutting work gets tagged by its center of gravity, not by every surface it touches. When two feel equally right, that's usually the signal to split into two issues. (The validator hints when it sees more than one.)
- **AI-handoff-bound issues declare ≥1 subtask.** The subtask is the handoff anchor. Issues a human resolves in five seconds don't need this.

**Don't add scheduling, release-bucket, or single-type fields without an explicit policy reversal.** This tracker treats those as project-management primitives that rot under continuous AI-driven shipping. If a future change makes one genuinely useful, that's a deliberate decision, not an oversight.

---

## Lifecycle — the 4 states & AI rules

States: `open` → `review` → `closed` | `cancelled`

| From | Allowed transitions | Notes |
|---|---|---|
| `open` | → `review`, → `cancelled` | Most common forward path is `open → review` |
| `review` | → `open`, → `closed` | `review → open` if pushback in a comment |
| `closed` | (terminal) | Generally don't reopen — file a new issue |
| `cancelled` | (terminal) | Always paired with a comment explaining why |

### AI rules — these are the most important rules in the whole skill

1. **Always mark `review`, never `closed` directly.** `closed` is a *human-only* transition in autonomous mode. The agent's job ends at `review` — the human inspects the artefact (PR, file diff, screenshot) and flips to `closed`.

2. **Default search scope is `open` + `review`.** When the user asks an open-ended question about issues ("what's blocked?", "what needs review?", "any duplicate work?"), search **only** `open` and `review` items. Skip `closed` and `cancelled` unless the prompt explicitly asks (e.g. "find closed issues that mentioned X"). This avoids noisy re-reads of shipped work.

3. **Subtask review-debt promotion.** An `open` issue with **any** `review`-state subtask is treated as review-gated — surface it under "needs review" even though its top-level status is still `open`. The Review tab in the UI does this automatically; the agent should follow the same logic when scanning.

4. **Mark `review` only when:**
   - Implementation is done from your perspective
   - All subtasks are `review` or `closed`
   - There's a verifiable artefact for the human (PR, file diff, screenshot, test output)
   - The agent-log captures what was tried and the final state

5. **`cancelled` requires a comment.** Always write a `comments/NNN_…md` explaining why before flipping to `cancelled`.

---

## Where to find what

Read **only the file(s) you need** — each is self-contained.

| File | Read it for |
|---|---|
| **Part 1 — Overall** | |
| [00_overview.md](00_overview.md) | *(this file)* operating model, lifecycle + AI rules, this index |
| [01_folder-layout.md](01_folder-layout.md) | the `<issue>/` folder tree, the 2-level subfolder rule, file/folder mixing, URL shapes |
| [02_settings.md](02_settings.md) | per-issue `settings.json` properties; which fields are derived vs stored |
| [03_vocabulary.md](03_vocabulary.md) | the tracker-root `settings.json` — `fields` vocabulary, authors, views |
| **Part 2 — Content (sub-document types)** | |
| [20_issue-md.md](20_issue-md.md) | `issue.md` — the goal/context body |
| [21_comments.md](21_comments.md) | comments — shape, naming, **+ add-a-comment recipe** |
| [22_notes.md](22_notes.md) | notes — freeform supporting docs, **+ add-a-note recipe** |
| [23_subtasks.md](23_subtasks.md) | subtasks — first-class leaf, numbering (`NN_`/`NNN_`), **+ create/update recipes** |
| [24_agent-logs.md](24_agent-logs.md) | agent-log — iteration trail + the **typed execution-workspace structure**, **+ add-entry recipe** |
| **Part 3 — Tools / activity** | |
| [41_searching.md](41_searching.md) | search scope, the no-`Grep` rule + synonyms, Haiku subagent patterns, the 8-CLI table |
| [42_updating.md](42_updating.md) | cross-cutting write flow: duplicate-check, creating an issue, validating, when *not* to edit |
| [43_moving-restructuring.md](43_moving-restructuring.md) | `docs-guide move` on the tracker (link-aware) + promoting/splitting/merging issues |
| **Part 4 — Examples** | |
| [61_multiple-subtasks.md](61_multiple-subtasks.md) | a standard implementation issue with several subtasks |
| [62_research-focused.md](62_research-focused.md) | a research/design issue — heavy `notes/`, few code subtasks |
| [63_agent-loops.md](63_agent-loops.md) | an issue worked across many agent-log iterations |
| [64_phase-index.md](64_phase-index.md) | the phase / index issue — a meta/epic whose subtasks are promoted to their own issues |

---

## Cross-references

- `@root/default-docs/data/user-guide/19_issues/` (the framework's bundled user-guide) — full section
- `@root/default-docs/data/user-guide/19_issues/01_overview.md` — canonical user-facing source
- `@root/default-docs/data/user-guide/19_issues/02_design-philosophy.md` — why the tracker is shaped this way
- `@root/default-docs/data/user-guide/19_issues/06_lifecycle-and-review.md` — deep dive on the 4-state model
- `@root/default-docs/data/user-guide/19_issues/09_using-with-ai.md` — agent-facing rules
- `@root/default-docs/data/user-guide/19_issues/04_settings/02_vocabulary.md` — tracker vocabulary spec
