---
name: agent-ks-issues
description: Use this skill for ANY work in an agent-knowledge-system issue tracker (data/todo/ or any folder-per-issue tracker) — creating, updating, searching, or restructuring issues, subtasks, comments, brainstorms, notes, plans, agent-logs, agent-memory, glossaries, the tracker vocabulary (settings.json/.jsonc), review queues, and the issues dump. It ALSO fires on the execution verbs against a tracked issue — "audit this", "refactor this", run a loop / ultracode / autonomous or iterative run, "let's discuss this point" — and whenever agent progress (goals, task lists, rounds of work) or issue-scoped agent memory should be recorded. Trigger eagerly whenever the user mentions issues, tickets, subtasks, the tracker, backlogs, priorities, components, labels, lifecycle states, or any file under a tracker folder — even if they don't say "issue tracker" explicitly. For docs pages, blog posts, site configuration, themes, images, or markdown writing OUTSIDE the tracker, use the agent-ks-docs skill instead.
---

# agent-ks-issues — the issue-tracker skill

Operating manual for any issue tracker in an agent-knowledge-system project. The default
tracker lives at `data/todo/`; a project may have several, all with the same shape
(folder-per-issue, `settings.json` metadata, vocabulary in the tracker root).

> **Sibling skill — `agent-ks-docs`.** That skill owns everything *outside* the
> tracker: docs sections, blog posts, `site.yaml` / themes / `.env`, and general markdown
> writing. This skill is self-contained for the *thinking* of tracker work (including
> [how to write inside issues](references/10_writing/10_writing.md)).
>
> **Prerequisite — also load `agent-ks-docs` for these in-tracker jobs:**
> - **Images / screenshots / figures inside an issue** (issue `assets/`, brainstorm
>   diagrams, a screenshot in a comment) → read its
>   [`images.md`](../agent-ks-docs/references/images.md) for the `agent-ks img`
>   optimization workflow. `10_writing.md` tells you *never to commit a raw screenshot*;
>   `images.md` is *how*.
> - **When the work leaves the tracker** — editing `site.yaml`/themes/`.env`
>   ([`settings-layout.md`](../agent-ks-docs/references/settings-layout.md)), or
>   authoring a docs page / blog post — hand off to `agent-ks-docs` entirely.
>
> The `agent-ks` CLI is shared by both skills; the full command reference is the
> sibling's [`cli-toolkit.md`](../agent-ks-docs/references/cli-toolkit.md).
>
> **Sibling skill — `agent-ks-artifacts`.** Building an HTML **artifact** to support an
> issue's thinking — a design-system draft or a data dashboard argued out in a
> `brainstorm/`, an explainer promoted to `notes/` — is *that* skill's job (treatment,
> dual-theme discipline, the dataviz procedure + palette validator, design-system flows).
> Load it for the **build**; this skill keeps the *tracker* concern: where the artifact
> lives and how it's referenced — a `.html` artifact in `notes/` or `brainstorm/` renders
> **embedded** as a first-class sub-doc (iframe + open-full-page, theme-synced) in the
> issue view (see [10_writing.md](references/10_writing/10_writing.md) and
> [22_notes.md](references/20_sections/22_notes.md#first-class-artifacts--diagrams)).

**Canonical source of truth:** the framework's bundled user-guide at
`@root/default-docs/data/user-guide/19_issues/` — when this skill is unclear or stale,
the user-guide wins, and the skill should then be updated (tell the user).

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

**Routing test, for any sentence you are about to write: which of those purposes is
it?** One → that is its home. Two → you are about to write it twice; split it, or you
have it in the wrong file.

`agent-log/` is the only section that carries two purposes, and they are sequential
rather than overlapping: the run is executed there, and its outcome lands there.

Each `references/20_sections/` page opens with a **Holds / Does not hold** table. Read
the "does not hold" half — it is the half that stops duplication.

### The four boundaries that get crossed most

| Boundary | The line |
|---|---|
| `subtasks/` ↔ `agent-log/` | **A subtask defines the work; the agent log carries it out.** Scope in one, execution in the other |
| `plans/` ↔ `subtasks/` | The plan owns **order and blocking**; a subtask owns **what the work is**. A subtask never states when it runs |
| `notes/` ↔ `subtasks/` | A note states the **conclusion**; the subtask states **what to do about it**. A note that reads like a work order is a subtask |
| `brainstorm/` ↔ `notes/` | Deliberation stays in `brainstorm/`; only the conclusion graduates |

Ordering on the index is `priority` desc, then recency (`updated`, derived from git)
desc; `created` comes from the folder slug. Execution state (actively working, stuck) is
carried by the **status**, not a label.

### Superseded wording is deleted, never kept

Correct in place and keep nothing. No struck-through text, no *"this previously
said…"*, no annotated-stale section. Where the history matters it belongs to the
tracker — the issue that made the change — never to the file being corrected.

This applies to what is already there, not only to what you write next: when you edit
a file and find a historical aside, **delete it**.

### Content that does not contribute is deleted

Nothing has to be kept. Delete it when it does not contribute to the issue, was never
implemented, or is redundant.

## Creation rules — when a thought earns what

All convention, never code-enforced. Full detail: [42_updating.md](references/40_operations/42_updating.md).

**Litmus test for a new issue: can you name its component and its first subtask in one
breath?** If not, it isn't an issue yet — it's one of:

- a **subtask** on the existing issue whose center of gravity it belongs to
  (one-prompt fixes always land here, never a new folder);
- a **brainstorm entry** inside the issue it informs (deliberation about *what to do*
  never opens its own issue);
- a **dump entry** if it has no home yet (see below).

**No record for small work.** A one-line change earns neither a subtask nor an agent
log. Group small changes against the larger block they belong to.

**Graduation:** a brainstorm graduates into `notes/` the moment something downstream
needs to cite its conclusion — mark it `**Resolved →** <target>` and leave the trail in
place. A "do nothing" resolution doesn't graduate. A note that keeps changing is a
brainstorm wearing the wrong hat.

**Subtasks are self-sufficient work orders, never one-liner scope markers.** Every
subtask must pass the cold-pickup test: could a human (or a fresh agent session) with
none of your context execute it? That means **deliverables spelled out, a "Done when"
acceptance block, and explicit links to the notes/brainstorms that scope it** — a
one-line body is acceptable only for a genuinely one-line mechanical task. Detail that
exists only in a conversation, a workflow prompt, or an agent's plan does not count as
scoped work; the subtask (or a note it links to) is where that detail lives. Full
contract: [23_subtasks.md](references/20_sections/23_subtasks.md).

**Subtasks are filed by CATEGORY, never by order.** A group is an *area* of work; a
number is a stable id and a sort key inside that area. Neither implies sequence — order
lives in a plan, and the same subtask may appear in several plans or in none.

**Comments tripwire:** a comment records *that* something happened, in a couple of
lines plus a pointer. Writing a second paragraph? You're debating (→ brainstorm) or
specifying (→ notes) — link, don't inline.

**Supersession:** an issue that shipped work stays an issue (close with a supersession
comment); an issue that is pure deliberation converging elsewhere folds into the
winner's `brainstorm/` (with a `**Resolved →**` overview + provenance) and is deleted —
git history keeps it.

**The issue dump:** unhomed half-formed thoughts go to a dump issue (component
`issue-dump` — a small set of dump issues, one per kind, each entry a subtask). A dump
entry graduates to a real issue exactly when it passes the litmus test — and is then
**deleted** from the dump, not ticked off.

## Lifecycle — statuses & AI rules

**One status vocabulary across the whole tracker** — issues, subtasks, plans, plan
stages, agent logs and iteration files all use these seven values in the `status` field.
**Fixed in framework code, colours included.** A tracker overrides nothing here: a
`fields.status` block or a `statusColors` map in the tracker root is a hard error, not a
customisation. Restyle a status through the theme's `--status-<name>` CSS variable, which
applies to the whole tracker.

| Category | Statuses |
|---|---|
| **Not Started** | `open` · `blocked` (depends on another item; reason in prose) |
| **In Progress** | `in-progress` |
| **Review** | `input-needed` (stuck, question inline) · `review` (done, awaiting sign-off) |
| **Closed** | `done` · `dropped` |

**Agent logs and iteration files use five of the seven** — `blocked` and `review` mean
nothing for a run.

> **Who may set `done` / `dropped` — and what those two words mean — depends on what
> carries the status.** An issue, a subtask, a plan, a plan stage and an agent log do not
> all have the same answer. The rule has exactly one home:
> **[Closing authority](references/00_anatomy/00_overview.md#closing-authority)**. Read
> it before you close anything; do not infer it from the word.

The AI rules are the most important rules in this skill:

1. **Manage `in-progress` yourself; hand off at the Review category.** Set `in-progress`
   when you start executing, and hand off with a verifiable artefact (PR, diff,
   screenshot, test output). Closing is governed by
   [Closing authority](references/00_anatomy/00_overview.md#closing-authority) above.
2. **Hit a wall → `input-needed`, not `blocked`.** Write the actual question **inline in
   the subtask/issue body** so a fresh session sees it; reserve `blocked` for a structural
   dependency on another issue/subtask.
3. **Default search scope is everything not Closed** (open, blocked, in-progress,
   input-needed, review) — skip the Closed category (`done`/`dropped`) unless explicitly asked.
4. **Review-debt promotion:** an active (non-closed) issue with any subtask in the
   **Review category** (`review` or `input-needed`) surfaces as "needs review" — it lands on
   the Review tab and **displays a `review` badge on the index** (display-only; the stored
   status is unchanged and the CLI/`--json` still report it, reverting once the subtask moves
   on). `blocked` never promotes — it rests, reason read in place.
5. **`dropped` on an issue or subtask requires a comment** explaining why, written first.

## Executing work — plans, agent logs, memory

### Plans — where order lives

A plan is a folder of **stages**: `plans/NN_<name>/` holding `settings.json`,
`overview.md`, and `NN_<stage>.md` files gap-spaced by ten.

- **A stage references the subtasks it schedules; it never restates them.** The renderer
  resolves those references live, so a plan cannot carry a stale count.
- **The active plan is the highest-numbered plan that is not `done` or `dropped`** —
  derived, never stored. One open at a time.
- **A plan is not a second copy of the subtask list.** It is the *ordering* and the
  *blocking* — exactly what a subtask cannot express, because a subtask does not know
  about its siblings.

```bash
agent-ks issue new-plan <id> --name <slug>
agent-ks issue new-stage <id> --plan <plan> --name <slug> [--after NN]
```

Full contract: [28_plans.md](references/20_sections/28_plans.md).

### Agent logs — where runs are carried out

**A log exists so a finding can be withdrawn** — a finding nobody wrote down cannot be
retracted, it just quietly keeps being believed. So one question decides it: **is there
something here that the finished work does not show?**

> **TRIGGER — any one, and it earns a log:** a later step changed course because of what
> an earlier step **returned** (executing a plan always does — open the log **before the
> first stage**) · something was **tried and discarded** · the user asked.
>
> **FLOOR — any one, and it does not:** the log would **restate the subtask** · **one**
> self-contained pass with **nothing discarded** — *one* is literal, so a loop or a
> fan-out is several passes and this floor does not reach it.
>
> **The floor beats triggers 1–2, never trigger 3. Neither fires → ask, once per
> session** — which is where independent repeated work lands.

**Never file count, never time spent.** A thirty-file rename has no path; a four-line fix
after three wrong diagnoses has nothing but path. And a **verify** (*did I break it*) is
not a stage — only an **audit** (*what is wrong here*) is, because its answer redirects
the work.

**Then, and only then, a separate question:** a run already open? **append to it**, even
one line — never open a second. None open and nothing follows? the subtask's Outcomes.
Unsure? **ask once per session, never per subtask**, and never make it a validator error.

```
agent-log/NNN_<kind>_<name>/     ← one run, one goal
├── settings.json                ←   optional: status → colours the kind symbol
├── 01_summary.md                ←   REQUIRED. The one conclusive file.
├── 02_working/                  ←   one file per iteration, plus producers'
│   ├── 00_index.md              ←     round index — seeded empty, written by hand
│   ├── 010_<round>.md           ←     iteration 01 — the orchestrator's file
│   ├── 011_<what-it-produced>.md←     a producer within it
│   └── 020_<round>.md           ←     iteration 02
├── 03_debrief/                  ←   what leaves this run
│   └── 01_handover.md
└── 100_wf_<sub-goal>/           ←   a child agent log — same shape, one level deeper
```

**Numbering: `NNN_` by convention, `NN`–`NNNNN` accepted, gap-spaced** — `010 020 030 …
090 100 110 120`. Runs keep counting past ninety-nine; the hundredth prefix is nothing
special.

**Inside a log, the prefix decides what a member is** — `< 100` is one of the run's own
three slots, `≥ 100` is a child agent log. Arithmetic rather than a reserved-name list,
so nothing is ambiguous and a fourth slot needs no code to know its name; the numbers
also state the order the three are meant to be read in. **That band means nothing
directly under `agent-log/`** — there, `100_lp_sweep` is simply the tenth run.

**Nesting stops at two levels of child log, and the reason is a hard cap.** The framework
ignores anything past **five** folder levels — no page, no error, just a console warning
in a build of hundreds of lines, so the content is gone and nothing says so.
`agent-log/ › run/ › child/ › 02_working/ › producer/` is already five. The validator
therefore errors one level early, to leave a child log room for its own contents.

Kind codes go in the folder name: `lp` loop · `au` audit · `rf` refactor · `it`
iteration · `wf` workflow; custom codes via `agentLogKinds` in the issue's
`settings.json`.

- **Read the agent log and `agent-memory/memory.md` before starting work** — the log so
  you don't repeat an approach that failed, `memory.md` because it is the pinned index of
  what is still true here.
- **`01_summary.md` IS the brief.** Point a delegated agent at it and spend the prompt
  on the delta. Never write a separate brief file.
- **An iteration is a GROUP** — of subtasks, of executions, of agents — not one agent
  and not one subtask. The orchestrator writes the iteration file from what the round
  produced.
- **A file exists because something was produced, not because an agent ran.** Two
  executors writing code produce one iteration file between them; two auditors writing
  reports produce two, plus the iteration's own.
- **`02_working/00_index.md` is the run's round index, WRITTEN by hand.** Optional, and
  conventionally there — seeded empty at scaffold so a run's shape is visible before it
  has one; one entry per round as it lands, carrying **a line of what the round found** —
  the part no header holds. It was generated once, and the generator and its checker
  shared a blind spot that certified a table with a round missing. **Nothing is an index
  because of its name or position**: `00_index.md` is the convention, not the test.
- **An index is a claim about other files, so check it by READING** —
  `/agent-ks-fast-index-check <path>`, a fast read-only subagent that reports and never
  edits. It runs two directions: *index → files* (is this claim still true — `STALE`,
  `ORPHAN`) and *files → index* (is everything here listed — `MISSING`). **The second
  needs a directory listing**, because an index's own links can never lead you to an
  entry it does not have. Plans especially: a stage whose subtasks are all closed while
  the stage is not. Not a gate, not automated; manual `ls` fallback and the full
  checklist in
  [24_agent-logs.md](references/20_sections/24_agent-logs.md#keeping-an-index-honest--a-reading-job-not-a-script).
- **Own goal → child agent log. No own goal → iteration file.** That is the only rule for
  *whether* to nest; the five-level cap above is the limit on *how far*. Nesting may
  mirror a structure that exists; it may never invent one.
- **Actionable items leave the log** and become subtasks. The debrief keeps a pointer.

**A plan becomes agent logs by milestone, not by stage.** The plan gets one log; each
milestone — a grouping you choose, which nothing in code knows about — gets a child log
covering two or three stages, and a stage becomes one or more **working files** inside it.
Work outside the plan gets its own top-level log; a *small* audit inside one is a working
file, not a log. The full mapping, with the diagram:
[24_agent-logs.md](references/20_sections/24_agent-logs.md#how-a-plan-becomes-agent-logs).

`agent-ks issue new-agent-log` scaffolds the folder and emits the file headings —
open what it made rather than reading a template here. Shape, numbering, the
iteration-file head and the worked examples:
[24_agent-logs.md](references/20_sections/24_agent-logs.md).

### The tracker is the durable home — a run's transcript is not

Anything produced *inside* a run (a workflow, loop, or subagent) that outlives the run
is written into the issue, not left in prompts, transcripts, or agent return values:
research and its sources, comparisons and benchmarks, the reasoning behind a decision,
contracts downstream work executes against (API shapes, schemas, ownership splits),
discovered constraints, findings.

**Persist it when it is produced** — before or as downstream work consumes it, never at
wrap-up. A run that dies must not take its reasoning with it. Orchestrators either write
these files themselves or instruct their agents to.

**When in doubt, persist — and the doubt is about *where*, not *how much*.** Route it:

| Scope | Home |
|---|---|
| Within one round — *"pick A, B, C or D here"* | the iteration file |
| Affects the rest of this run | the agent log's `03_debrief/` |
| Affects more than one run, or answers *"why did we do it this way?"* | the issue's `notes/` |
| Still in flux | the issue's `brainstorm/` |

One line plus a pointer in the places that reference it; the full text in its home,
once.

### Agent memory — always on

Maintain `agent-memory/` continuously; it is agent-owned and mutable in place.
`memory.md` is an **index that routes and stores nothing**, plus two buckets you grow
into: `knowledge/` (what is true and binding here, corrected in place) and `history/`
(how we got here, write-once). Most issues need only the index and a few topic files.
Precedence when two disagree: `knowledge/` > `history/`, and the loser gets corrected.

**Agent memory holds no plan and no decision record.** Order is the plan's; decisions
are `notes/`.

### Discussion is explicit-save-only

Working dialogue is saved (as a `discuss` brainstorm or a comment) **only when the user
asks**. When it turns dense or decision-bearing you may *offer* — never persist on your
own initiative.

## Triage — which reference to read

| Task | Read |
|---|---|
| Orientation: folder shapes, URL forms, nesting caps | [01_folder-layout.md](references/00_anatomy/01_folder-layout.md) |
| Per-issue `settings.json` fields | [02_per-issue-settings.md](references/00_anatomy/02_per-issue-settings.md) |
| Tracker-root vocabulary (status/priority/component/labels, views) | [03_overall-issue-tracker-vocabulary.md](references/00_anatomy/03_overall-issue-tracker-vocabulary.md) |
| Writing markdown inside issues (frontmatter, tags, diagrams, links) | [10_writing.md](references/10_writing/10_writing.md) |
| `issue.md` body | [20_issue-md.md](references/20_sections/20_issue-md.md) |
| Comments (+ add-a-comment recipe) | [21_comments.md](references/20_sections/21_comments.md) |
| Notes (+ add-a-note recipe) | [22_notes.md](references/20_sections/22_notes.md) |
| Subtasks: categories, numbering, states (+ recipes) | [23_subtasks.md](references/20_sections/23_subtasks.md) |
| Agent logs: shape, iteration files, worked examples | [24_agent-logs.md](references/20_sections/24_agent-logs.md) |
| Brainstorm: kinds, threads, graduation | [25_brainstorm.md](references/20_sections/25_brainstorm.md) |
| Agent-memory: index + buckets | [26_agent-memory.md](references/20_sections/26_agent-memory.md) |
| Guide panel & glossary.md | [27_guide-and-glossary.md](references/20_sections/27_guide-and-glossary.md) |
| Plans: stages, references, the active plan | [28_plans.md](references/20_sections/28_plans.md) |
| Searching (scope, no-Grep rule, subagent patterns) | [41_searching.md](references/40_operations/41_searching.md) |
| Creating issues, duplicate checks, validating | [42_updating.md](references/40_operations/42_updating.md) |
| Moving / promoting / splitting / merging | [43_moving-restructuring.md](references/40_operations/43_moving-restructuring.md) |
| Worked examples | [61](references/60_examples/61_multiple-subtasks.md) · [62](references/60_examples/62_research-focused.md) · [63](references/60_examples/63_agent-loops.md) · [64](references/60_examples/64_phase-index.md) |

## The CLI — `agent-ks`

The plugin ships one entrypoint, **`agent-ks`**, on `PATH`. Tracker work uses the
`issue` group:

| Command | Does |
|---|---|
| `list` · `show` · `subtasks` · `agent-logs` · `review-queue` | read |
| `set-state` · `add-comment` · `add-agent-log` | write |
| `new-subtask` | scaffolds a subtask — Overview / References / Todo list / Outcomes and Next Steps / Details |
| `new-agent-log` | scaffolds an agent log — `settings.json` + `01_summary.md`, and `02_working/00_index.md`; `03_debrief/` as work lands |
| `new-iteration` | opens the next iteration file in `02_working/`, head already written (`--producer` for a producer file) |
| `new-plan` · `new-stage` | opens a plan, and a stage inside it (`--after` inserts) |

Plus `agent-ks check issues`, `agent-ks find`, and `agent-ks move` (link-aware).
Discover with `agent-ks help`; uniform contract (`--help`, `--json`, exit codes 0/1/2).
**`agent-ks help <command>` abbreviates** — several commands accept more flags than it
lists, so check `--help` on the command itself before concluding an option is missing.

**Two slash commands and one agent belong to the tracker:**

| | |
|---|---|
| `/agent-ks-quick-idea-note [idea]` | Capture a half-formed idea into the issue dump as a subtask entry — no folder ceremony |
| `/agent-ks-fast-index-check [path]` | Report where an index disagrees with the files it references. Read-only; it never edits and is never automated |
| `agent-ks-index-checker` | The agent behind that command, for calling directly when sweeping several indexes at once |

**Inside a git worktree** (agent sandboxes): the CLI's `.env` search stops at the
worktree root — write a worktree-local `.env` or pass `--tracker` explicitly before any
write, so tracker paths resolve inside YOUR checkout.

**Search the tracker with `agent-ks issue list` (or `agent-ks find`), never the
`Grep` tool** — the CLI understands the schema (vocabulary, subtask states,
frontmatter) and composes structural filters with regex in one call. See
[41_searching.md](references/40_operations/41_searching.md).

For bulk reads (10+ files), hand the file list + question to a Haiku subagent and ask
for a tight report — patterns in [41_searching.md](references/40_operations/41_searching.md).

## Universal conventions (assumed by every reference)

- **Ordering prefix** `NN_`/`NNN_` — 2–5 digits, sorted by numeric value, `_` canonical,
  gap-spaced. **Mandatory** in `comments/`, `plans/`, `agent-log/` and `subtasks/`;
  optional in `notes/`, `brainstorm/` and `agent-memory/`. Existing unprefixed folders
  still load — the code accepts them for legacy content — but do not write new ones.
- **The prefix owns the number.** Never repeat it in frontmatter.
- **REFERENCE BY LINK, NEVER BY NUMBER OR PATH.** Another file is identified by a
  markdown link whose text says what it *is*:

  | Form | |
  |---|---|
  | `[040/100 the migration script](../040_execution/100_migration.md)` | **yes** — the ordering label makes it navigable against the numbered sidebar |
  | `[the migration script](../040_execution/100_migration.md)` | **yes** — the label is optional and only helps where numbers exist |
  | `` `subtasks/040_execution/100_migration.md` `` | **big no** — a path in backticks is text; `agent-ks move` cannot maintain it |

  A leading `/` is wrong too, and worse: it renders as a working link while `move` skips
  it, so it looks maintained and is not. The reasoning, the ordering-label spec and the
  one exception (a target that is not a document) live in
  [10_writing.md](references/10_writing/10_writing.md).
- **Frontmatter `title`** on every markdown file. The build does **not** fail without
  one — it falls back to the slug, so the page silently ships titled `_my-file`.
- **`settings.json` may be `.jsonc`** (comments + trailing commas) — prefer `.jsonc`
  for the tracker root and annotate what each component/label means.
- **Edit, don't rewrite**; append-only in `comments/` and `agent-log/`; preserve
  optional `color:` frontmatter when editing.
- An optional per-issue `glossary.md` documents what colours/terms mean — check it
  before interpreting tinted labels.
