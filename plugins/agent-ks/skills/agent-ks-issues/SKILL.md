---
name: agent-ks-issues
description: Use this skill for ANY work in an agent-knowledge-system issue tracker (data/todo/ or any folder-per-issue tracker) — creating, updating, searching, or restructuring issues, subtasks, comments, brainstorms, notes, plans, agent-logs, agent-memory, glossaries, the tracker vocabulary (settings.json/.jsonc), review queues, and the issues dump. It ALSO fires on the execution verbs against a tracked issue — "audit this", "refactor this", run a loop / ultracode / autonomous or iterative run, "let's discuss this point" — and whenever agent progress (goals, task lists, rounds of work) or issue-scoped agent memory should be recorded. Trigger eagerly whenever the user mentions issues, tickets, subtasks, the tracker, backlogs, priorities, components, labels, lifecycle states, or any file under a tracker folder — even if they don't say "issue tracker" explicitly. For docs pages, blog posts, site configuration, themes, images, or markdown writing OUTSIDE the tracker, use the agent-ks-docs skill instead.
---

# agent-ks-issues — the issue-tracker skill

Operating manual for any issue tracker in an agent-knowledge-system project. The default
tracker lives at `data/todo/`; a project may have several, all with the same shape
(folder-per-issue, `settings.json` metadata, vocabulary in the tracker root).

**Canonical source of truth:** the framework's bundled user-guide at
`@root/default-docs/data/user-guide/19_issues/`. When this skill is unclear or stale, the
user-guide wins, and the skill should then be updated (tell the user).

**Sibling skills.** `agent-ks-docs` owns everything outside the tracker, and it also owns
three things this skill uses: the markdown mechanics and the linking rule
([writing.md](../agent-ks-docs/references/writing.md)), image optimisation
([images.md](../agent-ks-docs/references/images.md)), and the full CLI reference
([cli-toolkit.md](../agent-ks-docs/references/cli-toolkit.md)). `agent-ks-artifacts`
owns building an HTML artifact; this skill only says where one lives in an issue
([22_notes.md](references/20_sections/22_notes.md#first-class-artifacts--diagrams)).
When the work leaves the tracker (a docs page, `site.yaml`, a theme), hand off to
`agent-ks-docs` entirely.

## Operating model — what this tracker is

The tracker is **comprehensive memory of thought-work for AI-augmented development**,
not a project-management tool. An issue is a folder capturing one coherent unit of
*thinking + execution*; the value is the recorded reasoning, not "what's left to do".

### The one rule underneath everything

> **No file stores a fact another file owns.**

Every section has **one** purpose. Write each fact in the section that owns it, and
point at it from anywhere else that needs it.

| Section | What it is for | In a word | Reference |
|---|---|---|---|
| `issue.md` + `settings.json` | The problem, its context, its metadata | **the issue** | [20](references/20_sections/20_issue-md.md) · [02](references/00_anatomy/02_per-issue-settings.md) |
| `brainstorm/` | Initial ideation, and the iterating that follows it | **thinking** | [25](references/20_sections/25_brainstorm.md) |
| `notes/` | Finalization — what is settled and binding | **conclusions** | [22](references/20_sections/22_notes.md) |
| `plans/` | Grouping, structuring, and the order of execution | **order** | [28](references/20_sections/28_plans.md) |
| `subtasks/` | Actionable items, their detail, and the links to the notes that scope them | **scope** | [23](references/20_sections/23_subtasks.md) |
| `agent-log/` | Where a run is carried out, and where its outcome is recorded | **execution + outcome** | [24](references/20_sections/24_agent-logs.md) |
| `agent-memory/` | What is worth remembering across this issue | **memory** | [26](references/20_sections/26_agent-memory.md) |
| `comments/` | That something happened, and when | **events** | [21](references/20_sections/21_comments.md) |
| `glossary.md` (optional) | This issue's colour legend / terms | — | [27](references/20_sections/27_guide-and-glossary.md) |

**Routing test for any sentence you are about to write: which of those purposes is
it?** One → that is its home. Two → you are about to write it twice; split it.

Each `references/20_sections/` page opens with a **Holds / Does not hold** table. Read
the "does not hold" half — it is the half that stops duplication.

### The four boundaries that get crossed most

| Boundary | The line |
|---|---|
| `subtasks/` ↔ `agent-log/` | **A subtask defines the work; the agent log carries it out.** Scope in one, execution in the other |
| `plans/` ↔ `subtasks/` | The plan owns **order and blocking**; a subtask owns **what the work is**. A subtask never states when it runs |
| `notes/` ↔ `subtasks/` | A note states the **conclusion**; the subtask states **what to do about it**. A note that reads like a work order is a subtask |
| `brainstorm/` ↔ `notes/` | Deliberation stays in `brainstorm/`; only the conclusion graduates |

### Superseded wording is deleted, never kept

Correct in place and keep nothing: no struck-through text, no *"this previously
said…"*, no stale section. Where the history matters it belongs to the tracker, never
to the file being corrected. This applies to what is already there: when you edit a
file and find a historical aside, **delete it**. The same goes for content that does not
contribute to the issue, was never implemented, or is redundant.

## Creation rules — when a thought earns what

Convention, never code-enforced. Full detail: [42_updating.md](references/40_operations/42_updating.md).

**Litmus test for a new issue: can you name its component and its first subtask in one
breath?** If not, it is one of:

- a **subtask** on the existing issue whose center of gravity it belongs to (one-prompt
  fixes always land here, never a new folder);
- a **brainstorm entry** inside the issue it informs;
- a **dump entry** if it has no home yet — a dump issue (component `issue-dump`), one
  subtask per entry; an entry that passes the litmus test is promoted and **deleted**
  from the dump.

**No record for small work.** A one-line change earns neither a subtask nor an agent
log. Group small changes against the larger block they belong to.

**Subtasks are self-sufficient work orders.** Could a fresh session with none of your
context execute it? Deliverables spelled out, a "Done when" block, links to the notes
that scope it. Detail that exists only in a conversation or a prompt is not scoped
work. Contract: [23_subtasks.md](references/20_sections/23_subtasks.md).

**Subtasks are filed by CATEGORY, never by order.** A number is a stable id and a sort
key inside an area. Order lives in a plan.

**Comments tripwire:** a couple of lines plus a pointer. A second paragraph means you are
debating (→ brainstorm) or specifying (→ notes).

**Graduation and supersession:** a brainstorm graduates into `notes/` when something
downstream needs to cite its conclusion — mark it `**Resolved →** <target>`, leave the
trail. An issue that shipped work stays an issue; an issue that is pure deliberation
converging elsewhere folds into the winner's `brainstorm/` and is deleted.

## Lifecycle — the must-know

One status vocabulary, eight values in four categories, across issues, subtasks,
plans, plan stages, agent logs and iteration files. Fixed in framework code, colours
included; a tracker overrides nothing here.

| Category | Statuses |
|---|---|
| **Not Started** | `open` · `blocked` (depends on another item; reason in prose) |
| **In Progress** | `in-progress` |
| **Review** | `input-needed` (stuck, question inline) · `review` (done, awaiting sign-off) |
| **Closed** | `done` (shipped) · `dropped` (abandoned) · `superseded` (scope moved; needs a `→ where` line) |

Runs (agent logs, iteration files) use five of the eight: no `blocked`, `review` or
`superseded`.

> **Your ceiling on an issue or a subtask is `review`, `input-needed`, or `superseded`
> with its `→` line. `done` and `dropped` there are the user's.** You close your own
> runs, plans and stages. The full rule, and the six AI rules that go with it, have one
> home: [00_overview.md](references/00_anatomy/00_overview.md#closing-authority). Read it
> before you close anything.

## Executing work — plans, agent logs, memory

**Plans — where order lives.** A plan is `plans/NN_<name>/` holding `settings.json`,
`overview.md`, and `NN_<stage>.md` files gap-spaced by ten. A stage references the
subtasks it schedules and never restates them. The active plan is the highest-numbered
plan that is not Closed — derived, never stored. Contract:
[28_plans.md](references/20_sections/28_plans.md).

**Agent logs — where runs are carried out.** A log exists so a finding can be withdrawn.
One question decides it: **is there something here that the finished work does not
show?**

> **TRIGGER — any one, and it earns a log:** a later step changed course because of what
> an earlier step returned (executing a plan always does — open the log **before the
> first stage**) · something was tried and discarded · the user asked.
>
> **FLOOR — any one, and it does not:** the log would restate the subtask · one
> self-contained pass with nothing discarded.
>
> **The floor beats triggers 1–2, never trigger 3. Neither fires → ask, once per
> session.** Never file count, never time spent. A run already open? **Append to it.**

The full rule, the limits, the 14 worked cases, the folder shape and the numbering are in
[24_agent-logs.md](references/20_sections/24_agent-logs.md). Three things to hold
without opening it:

- **Read the agent log and `agent-memory/memory.md` before starting work.**
- **`01_summary.md` IS the brief.** Point a delegated agent at it; never write a separate
  brief file.
- **Own goal → child agent log. No own goal → iteration file.** Nesting stops at two
  levels of child log; the loader drops anything past five folder levels in silence.

**The tracker is the durable home; a run's transcript is not.** Anything produced inside
a run that outlives it — research, comparisons, the reasoning behind a decision,
contracts downstream work executes against — is written into the issue **when it is
produced**, never at wrap-up. Route it:

| Scope | Home |
|---|---|
| Within one round | the iteration file |
| Affects the rest of this run | the agent log's `03_debrief/` |
| Affects more than one run, or answers *"why did we do it this way?"* | the issue's `notes/` |
| Still in flux | the issue's `brainstorm/` |

**Agent memory — always on.** Maintain `agent-memory/` continuously; it is agent-owned
and mutable in place. `memory.md` is an index that stores nothing; `knowledge/` holds what
is true (corrected in place), `history/` how we got here (write-once). It holds no plan
and no decision record. Contract: [26_agent-memory.md](references/20_sections/26_agent-memory.md).

**Discussion is explicit-save-only.** Working dialogue is saved (as a `discuss` brainstorm
or a comment) only when the user asks. When it turns decision-bearing you may *offer*.

## Triage — which reference to read

| Task | Read |
|---|---|
| Orientation: folder shapes, URL forms, nesting caps | [01_folder-layout.md](references/00_anatomy/01_folder-layout.md) |
| Per-issue `settings.json` fields | [02_per-issue-settings.md](references/00_anatomy/02_per-issue-settings.md) |
| Tracker-root vocabulary (priority/component/labels, views) | [03_overall-issue-tracker-vocabulary.md](references/00_anatomy/03_overall-issue-tracker-vocabulary.md) |
| Lifecycle in full, closing authority, the AI rules | [00_overview.md](references/00_anatomy/00_overview.md) |
| Writing inside issues: per-subdoc frontmatter, tracker linking, prefixes | [10_writing.md](references/10_writing/10_writing.md) |
| `issue.md` body | [20_issue-md.md](references/20_sections/20_issue-md.md) |
| Comments (+ recipe) | [21_comments.md](references/20_sections/21_comments.md) |
| Notes (+ recipe, artifacts and diagrams in an issue) | [22_notes.md](references/20_sections/22_notes.md) |
| Subtasks: categories, numbering, the work-order template (+ recipes) | [23_subtasks.md](references/20_sections/23_subtasks.md) |
| Agent logs: when one opens, shape, iteration files, worked examples | [24_agent-logs.md](references/20_sections/24_agent-logs.md) |
| Brainstorm: kinds, threads, graduation | [25_brainstorm.md](references/20_sections/25_brainstorm.md) |
| Agent-memory: index + buckets | [26_agent-memory.md](references/20_sections/26_agent-memory.md) |
| Guide panel & `glossary.md` | [27_guide-and-glossary.md](references/20_sections/27_guide-and-glossary.md) |
| Plans: stages, references, the active plan | [28_plans.md](references/20_sections/28_plans.md) |
| Searching: scope, the no-Grep rule, subagent patterns | [41_searching.md](references/40_operations/41_searching.md) |
| Creating issues, duplicate checks, validating | [42_updating.md](references/40_operations/42_updating.md) |
| Moving / promoting / splitting / merging | [43_moving-restructuring.md](references/40_operations/43_moving-restructuring.md) |
| Worked examples | [61](references/60_examples/61_multiple-subtasks.md) · [62](references/60_examples/62_research-focused.md) · [63](references/60_examples/63_agent-loops.md) · [64](references/60_examples/64_phase-index.md) |

## The CLI — `agent-ks`

One entrypoint on `PATH`. Tracker work uses the `issue` group:

| Command | Does |
|---|---|
| `list` · `show` · `subtasks` · `agent-logs` · `review-queue` | read |
| `set-state` · `add-comment` · `add-agent-log` | write |
| `new-subtask` · `new-plan` · `new-stage` · `new-agent-log` · `new-iteration` | scaffold |

Plus `agent-ks check issues`, `agent-ks find`, and `agent-ks move` (link-aware). Every
flag: [cli-toolkit.md](../agent-ks-docs/references/cli-toolkit.md). Discover with
`agent-ks help`. **An unrecognised flag is ignored silently** — check spelling against
`agent-ks help <command>` when a filter appears to do nothing.

**Search the tracker with `agent-ks issue list` (or `agent-ks find`), never the `Grep`
tool.** The CLI understands the schema and composes structural filters with regex in one
call. The default scope hides the Closed category; "not found" is not "does not exist".
See [41_searching.md](references/40_operations/41_searching.md), which also carries the
Haiku subagent patterns for bulk reads.

**Inside a git worktree** the CLI's `.env` search stops at the worktree root. Write a
worktree-local `.env` or pass `--tracker` before any write.

**Two slash commands and one agent belong to the tracker:**

| | |
|---|---|
| `/agent-ks-quick-idea-note [idea]` | Capture a half-formed idea into the issue dump as a subtask entry |
| `/agent-ks-fast-index-check [path]` | Report where an index disagrees with the files it references. Read-only, never automated |
| `agent-ks-index-checker` | The agent behind that command, for sweeping several indexes at once |

## Universal conventions (assumed by every reference)

- **Ordering prefix** `NN_`/`NNN_` — 2–5 digits, sorted by numeric value, `_` canonical,
  gap-spaced. **Mandatory** in `comments/`, `plans/`, `agent-log/` and `subtasks/`;
  optional in `notes/`, `brainstorm/` and `agent-memory/`. The prefix owns the number;
  never repeat it in frontmatter.
- **Reference by link, never by number or path.** `[040/100 the migration script](../040_execution/100_migration.md)`,
  never `` `subtasks/040_execution/100_migration.md` `` and never a leading `/`. The
  rule and the ordering label: [writing.md → Linking](../agent-ks-docs/references/writing.md#linking).
- **Frontmatter `title`** on every markdown file. Nothing enforces it in the tracker; a
  missing one ships the slug as the title.
- **`settings.json` may be `.jsonc`**; prefer `.jsonc` for the tracker root and annotate
  what each component and label means.
- **Edit, don't rewrite**; append-only in `comments/` and `agent-log/`; preserve
  optional `color:` frontmatter when editing, and check the issue's `glossary.md` before
  interpreting a colour.
