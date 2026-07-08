---
name: agent-ks-issues
description: Use this skill for ANY work in an agent-knowledge-system issue tracker (data/todo/ or any folder-per-issue tracker) — creating, updating, searching, or restructuring issues, subtasks, comments, brainstorms, notes, agent-logs, agent-memory, glossaries, the tracker vocabulary (settings.json/.jsonc), review queues, and the issues dump. It ALSO fires on the execution verbs against a tracked issue — "audit this", "refactor this", run a loop / ultracode / autonomous or iterative run, "let's discuss this point" — and whenever agent progress (goals, task-lists, milestones) or issue-scoped agent memory should be recorded. Trigger eagerly whenever the user mentions issues, tickets, subtasks, the tracker, backlogs, priorities, components, labels, lifecycle states, or any file under a tracker folder — even if they don't say "issue tracker" explicitly. For docs pages, blog posts, site configuration, themes, images, or markdown writing OUTSIDE the tracker, use the agent-ks-docs skill instead.
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

The natural flow (no required order — sections are organized by what they *hold*):
**deliberate** (`brainstorm/`) → **write down** (`notes/`) → **plan** (`subtasks/`) →
**execute** (`agent-log/`), with `comments/` as the flat evolution log of the issue
itself and `agent-memory/` as the always-on, agent-owned working state.

| Section | Owner | Lifecycle | Holds |
|---|---|---|---|
| `issue.md` + `settings.json` | both | — | Problem, context, metadata ([20](references/20_sections/20_issue-md.md), [02](references/00_anatomy/02_per-issue-settings.md)) |
| `brainstorm/` | human + AI | in-flux | Active deliberation ([25](references/20_sections/25_brainstorm.md)) |
| `notes/` | human + AI | finalized | Finalized output + references ([22](references/20_sections/22_notes.md)) |
| `subtasks/` | both | plan | The checklist of what's to be done ([23](references/20_sections/23_subtasks.md)) |
| `agent-log/` | AI | append-only | Execution record, activity folders ([24](references/20_sections/24_agent-logs.md)) |
| `agent-memory/` | AI | mutable | Issue-scoped agent working state ([26](references/20_sections/26_agent-memory.md)) |
| `comments/` | both | append, flat | Evolution log, not a forum ([21](references/20_sections/21_comments.md)) |
| `glossary.md` (optional) | human | — | This issue's colour legend / terms ([27](references/20_sections/27_guide-and-glossary.md)) |

Ordering is `priority` desc, then recency (`updated`, derived from git) desc; `created`
comes from the folder slug. Transient execution state ("actively working", stuck) is now
carried by the **status** itself (`in-progress`, `blocked`, `input-needed`), not a label —
the old `wip` label is deprecated in place.

## Creation rules — when a thought earns what

All convention, never code-enforced. Full detail: [42_updating.md](references/40_operations/42_updating.md).

**Litmus test for a new issue: can you name its component and its first subtask in one
breath?** If not, it isn't an issue yet — it's one of:

- a **subtask** on the existing issue whose center of gravity it belongs to
  (one-prompt fixes always land here, never a new folder);
- a **brainstorm entry** inside the issue it informs (deliberation about *what to do*
  never opens its own issue);
- a **dump entry** if it has no home yet (see below).

**Routing between sections** — two questions, four boxes:

| | In motion | Settled |
|---|---|---|
| **Thinking** | `brainstorm/` | `notes/` |
| **Doing** | `subtasks/` (the plan) | `agent-log/` (how it went) |

**Graduation:** a brainstorm graduates into `notes/` the moment something downstream
needs to cite its conclusion — mark it `**Resolved →** <target>` and leave the trail in
place. A "do nothing" resolution doesn't graduate. A note that keeps changing is a
brainstorm wearing the wrong hat.

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

**7 statuses in 4 categories** (issues and subtasks share one vocabulary and one field,
`status`; both fixed in framework code — a tracker overrides only colors):

| Category | Statuses |
|---|---|
| **Not Started** | `open` · `blocked` (depends on another item; reason in prose) |
| **In Progress** | `in-progress` |
| **Review** | `input-needed` (stuck, question inline) · `review` (done, awaiting sign-off) |
| **Closed** | `done` · `dropped` |

The AI rules are the most important rules in this skill:

1. **Manage `in-progress` yourself; hand off at the Review category, never `done`.** Set
   `in-progress` when you start executing. Your ceiling is `review` (or `input-needed`) —
   `done`/`dropped` are **human-only** transitions. Hand off with a verifiable artefact
   (PR, diff, screenshot, test output).
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
5. **`dropped` requires a comment** explaining why, first (human-only).

## Executing work — agent-log, memory, discussion

When you run substantive work against an issue (a loop, audit, refactor, or any dense
execution), record it in `agent-log/` as an **activity folder** —
`NNN_<code>_<name>/` with the kind code in the folder name (`lp` loop · `au` audit ·
`rf` refactor · `it` iteration · `wf` workflow; custom codes via `agentLogKinds` in the
issue's `settings.json`). Inside: `00_goal.md` / `01_summary.md` / `02_task_list.md`
meta files, then `MNN_` milestone files (`101_…`, `102_…`).

- **Read the agent-log before starting work** — don't repeat failed approaches.
- **Log milestones, not steps** (~3–6 per activity), keep failed ones, **write files
  directly** with real `## Goal / Approach / Result / Next` headings — never funnel a
  multi-line body through `--body "…"`.
- **One milestone per natural unit of the kind** — `wf`: one per top-level phase
  (build / verify / fix each get their own — never one file for the whole run);
  `lp`: one per iteration (roll up small/rapid rounds); `au`: sweep → findings →
  fixes; `rf`: one per structural move; `it`: one per coherent chunk. Sub-steps are
  bullets inside a milestone, never their own files. **Default rhythm** (flex it,
  keep the invariants): scaffold folder + goal before starting → stub the milestone
  `in-progress` when its unit begins → update to `success`/`failed` with results on
  completion. Dense deliverables a run produces (architecture write-ups, diagrams,
  HTML artifacts via the **agent-ks-artifacts** skill) graduate to `notes/` —
  the milestone links to them, never inlines them.
- **Milestone frontmatter is required, not optional:** `iteration:` (drives the `#N`
  badge, counts 1, 2, 3… within the activity), `agent:`, `date:`, and `status:` from
  `not-started | in-progress | success | failed` — never the subtask vocabulary
  (`done` on a milestone is wrong). And **`01_summary.md` at wrap, every run**.
- **Every file — goal, summary, task-list, milestone, subtask — is structured,
  context-setting prose, never a bare dump.** Even a single-line thought gets a
  couple of explanatory sentences a cold reader can follow.
- **Agent-memory is always on:** maintain `agent-memory/` (a `memory.md` index +
  topic files) continuously — it's agent-autonomous and mutable in place.
- **Discussion is explicit-save-only:** working dialogue is saved (as a `discuss`
  brainstorm or a comment) **only when the user asks**; when it turns dense or
  decision-bearing you may *offer* — never persist on your own initiative.

Full detail + recipes: [24_agent-logs.md](references/20_sections/24_agent-logs.md),
[26_agent-memory.md](references/20_sections/26_agent-memory.md).

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
| Subtasks: numbering, groups, states (+ recipes) | [23_subtasks.md](references/20_sections/23_subtasks.md) |
| Agent-log activity folders (+ add-entry recipe) | [24_agent-logs.md](references/20_sections/24_agent-logs.md) |
| Brainstorm: kinds, threads, graduation | [25_brainstorm.md](references/20_sections/25_brainstorm.md) |
| Agent-memory: index + topics | [26_agent-memory.md](references/20_sections/26_agent-memory.md) |
| Guide panel & glossary.md | [27_guide-and-glossary.md](references/20_sections/27_guide-and-glossary.md) |
| Searching (scope, no-Grep rule, subagent patterns) | [41_searching.md](references/40_operations/41_searching.md) |
| Creating issues, duplicate checks, validating | [42_updating.md](references/40_operations/42_updating.md) |
| Moving / promoting / splitting / merging | [43_moving-restructuring.md](references/40_operations/43_moving-restructuring.md) |
| Worked examples | [61](references/60_examples/61_multiple-subtasks.md) · [62](references/60_examples/62_research-focused.md) · [63](references/60_examples/63_agent-loops.md) · [64](references/60_examples/64_phase-index.md) |

## The CLI — `agent-ks`

The plugin ships one entrypoint, **`agent-ks`**, on `PATH`. Tracker work uses the
`issue` group — `agent-ks issue list / show / subtasks / agent-logs / set-state /
add-comment / add-agent-log / review-queue` — plus `agent-ks check issues`,
`agent-ks find`, and `agent-ks move` (link-aware). Discover with `agent-ks help`;
uniform contract (`--help`, `--json`, exit codes 0/1/2).

**Search the tracker with `agent-ks issue list` (or `agent-ks find`), never the
`Grep` tool** — the CLI understands the schema (vocabulary, subtask states,
frontmatter) and composes structural filters with regex in one call. See
[41_searching.md](references/40_operations/41_searching.md).

For bulk reads (10+ files), hand the file list + question to a Haiku subagent and ask
for a tight report — patterns in [41_searching.md](references/40_operations/41_searching.md).

## Universal conventions (assumed by every reference)

- **Ordering prefix** `NN_`/`NNN_` — 2–5 digits, sorted by numeric value, `_` canonical,
  gap-spaced. Optional for issue subdocs (required by convention only for subtasks'
  ordering); both 2- and 3-digit are conventional in the tracker.
- **Frontmatter `title`** on every markdown file (Astro builds fail without it).
- **`settings.json` may be `.jsonc`** (comments + trailing commas) — prefer `.jsonc`
  for the tracker root and annotate what each component/label means.
- **Edit, don't rewrite**; append-only in `comments/` and `agent-log/`; preserve
  optional `color:` frontmatter when editing.
- An optional per-issue `glossary.md` documents what colours/terms mean — check it
  before interpreting tinted labels.
