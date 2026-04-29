# Issue tracker — reference

How to read, write, and navigate any issue tracker in this project. The default tracker lives at `data/todo/`; a project may have multiple trackers, all following this same shape.

**Canonical source of truth:** the framework's bundled `@root/default-docs/data/user-guide/19_issues/` — read those pages when this reference is unclear or you need depth this file doesn't cover.

---

## 1. Folder & file layout

Every tracker has the same skeleton:

```
<tracker-base>/                                  ← e.g. data/todo/
├── settings.json                                ← TRACKER VOCABULARY (status, priority, component, milestone, labels)
└── <YYYY-MM-DD-slug>/                           ← one folder per issue
    ├── settings.json                            ← issue metadata
    ├── issue.md                                 ← main body (the goal / context)
    ├── comments/                                ← chronological discussion (flat)
    │   └── NNN_<date>_<author>.md
    ├── subtasks/                                ← atomic units of work (flat)
    │   └── NNN_<slug>.md
    ├── notes/                                   ← supporting design docs (up to 2 subfolder levels)
    │   ├── <slug>.md                            ← root-level note
    │   └── <group>/
    │       ├── <slug>.md                        ← level-1 note
    │       └── <subgroup>/
    │           └── <slug>.md                    ← level-2 note (deepest the loader accepts)
    └── agent-log/                               ← AI iteration audit trail (up to 2 subfolder levels)
        ├── <slug>.md                            ← root-level entry (NNN_ prefix optional)
        └── <group>/
            ├── <slug>.md
            └── <subgroup>/
                └── <slug>.md
```

**Folder naming regex:** `^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$` (date + kebab-case slug).

**Stray root-level `.md` inside an issue folder is a warning.** Surface it to the user — don't silently include or ignore.

**`notes/` and `agent-log/` subfolder rules:**
- Up to **2 levels of nesting** (`<group>/<subgroup>/<file>.md`). Anything deeper is logged as a warning by the loader and silently skipped — never relied on.
- **Files and folders can mix at every level** that allows folders. So `notes/intro.md` can sit beside `notes/design/`, and `notes/design/overview.md` can sit beside `notes/design/phase-1/`. Only the deepest level (level 2) is files-only.
- **No `NNN_` prefix required.** Filenames are freeform; if an `agent-log` filename happens to start with `NNN_`, the prefix is parsed as the iteration sequence number, otherwise the loader assigns one based on sort order within the leaf folder.
- `comments/` and `subtasks/` stay flat — no subfolders.

---

## 2. Properties of an issue (`<issue>/settings.json`)

```json
{
  "title": "Human-readable issue title",
  "description": "1-3 sentence summary",
  "status": "open",
  "priority": "medium",
  "component": ["live-editor", "integrations"],
  "milestone": "phase-2",
  "labels": ["feature", "wip"],
  "author": "sidhantha",
  "assignees": [],
  "updated": "2026-04-19",
  "due": "2026-04-25"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Display label |
| `description` | string | optional | Short summary; longer detail goes in `issue.md` |
| `status` | enum | ✅ | One of the 4 lifecycle states (see §4) |
| `priority` | enum | ✅ | From tracker vocabulary (`fields.priority.values`) |
| `component` | **string[]** | ✅ | Multi-select; values from `fields.component.values` |
| `milestone` | enum | ✅ | From `fields.milestone.values` |
| `labels` | string[] | ✅ | Multi-select; values from `fields.labels.values` (often `[]`) |
| `author` | string | ✅ | Must be in tracker `authors` list |
| `assignees` | string[] | ✅ | Often `[]`; otherwise members of `authors` |
| `updated` | YYYY-MM-DD | ✅ | Last meaningful change date |
| `due` | YYYY-MM-DD or null | optional | Used for overdue-row highlighting |
| `draft` | boolean | optional | If `true`, hidden from the tracker UI |

**`null` / missing handling:** `due: null` means "no deadline." Missing `labels` / `assignees` → treat as `[]`. Missing `component` → treat as `[]` and surface as a validation issue (it's required).

**Assignees double as the "in-progress" signal.** An issue with `assignees.length > 0` is actively being worked on; `assignees: []` is unassigned and idle. **Do not propose adding a separate `in_progress` boolean** — two sources of truth for the same fact will drift. Anything that needs the in-progress signal should derive it from `assignees`.

The tracker exposes this as a two-tier filter:

- **Coarse** — pseudo-values `assigned` / `unassigned` ("is anybody on it?")
- **Fine** — specific names from the tracker root's `authors[]` ("what is X working on?")

Both compose AND across fields, OR within a field — same as every other filter dimension.

---

## 3. Tracker vocabulary (`<tracker-base>/settings.json`)

Defines the enum values every issue draws from:

```json
{
  "label": "Todo",
  "fields": {
    "status":    { "values": ["open", "review", "closed", "cancelled"], "colors": {...} },
    "priority":  { "values": ["low", "medium", "high", "urgent"],       "colors": {...} },
    "component": { "values": ["live-editor", "integrations", ...] },
    "milestone": { "values": ["phase-1", "phase-2", ...] },
    "labels":    { "values": ["wip", "blocked", "feature", "bug", ...] }
  },
  "authors": ["sidhantha", "claude"],
  "views": [ ... preset views ... ]
}
```

When creating an issue, **all enum values must come from this vocabulary**. To add a new value, edit the tracker `settings.json` first, then use it.

Three vocabulary layers:

1. **Tracker-wide** — root `settings.json` (above)
2. **Per-issue** — values picked from the tracker vocabulary
3. **Per-subtask** — `state` field uses the same 4-state vocabulary as `status`, but tracked independently per subtask

---

## 4. Lifecycle — the 4 states & AI rules

States: `open` → `review` → `closed` | `cancelled`

| From | Allowed transitions | Notes |
|---|---|---|
| `open` | → `review`, → `cancelled` | Most common forward path is `open → review` |
| `review` | → `open`, → `closed` | `review → open` if pushback in a comment |
| `closed` | (terminal) | Generally don't reopen — file a new issue |
| `cancelled` | (terminal) | Always paired with a comment explaining why |

### AI rules — these are the most important rules in the skill

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

## 5. Sub-documents

### `issue.md` — the goal / context

Read first when picking up an issue. Contains the *why*, the user-facing description of the work, success criteria, scope decisions, links to related issues. Length varies — typically 50-300 lines.

### `comments/NNN_<date>_<author>.md`

Chronological discussion. Frontmatter:
```yaml
---
author: claude
date: 2026-04-24
---

# Optional title

Body...
```

Naming convention: `NNN_<YYYY-MM-DD>_<author>.md` is the spec, but in practice many comments use `NNN_<short-slug>.md`. Either works; check what the issue already uses and match.

### `subtasks/NNN_<slug>.md`

Atomic unit of work. Frontmatter:
```yaml
---
title: "Short imperative title"
done: false
state: open
---

Body — describe the work in enough detail that someone (or an agent) can pick it up cold.
```

`done: true` should be paired with `state: closed` (or `review`). `state` follows the same 4-state vocabulary as issue `status`.

### `notes/[<group>/[<subgroup>/]]<slug>.md`

Supporting design docs — research, design decisions, reference material that doesn't belong in `issue.md`. No state, no numbering. Frontmatter is minimal (often just `title`). May live at the root of `notes/`, or one or two folders deeper for grouping (e.g. `notes/design/phase-1/kickoff.md`). Folder names are freeform.

### `agent-log/[<group>/[<subgroup>/]]<slug>.md` — **read these first when picking up work**

Audit trail of prior AI iterations. **Always read before starting work** — past iterations may have failed approaches you'd otherwise repeat.

Frontmatter:
```yaml
---
iteration: 3
agent: claude-opus-4-7
status: success      # in-progress | success | failed
date: 2026-04-24
---
```

Body structure:
- **Goal** — what was being attempted
- **Approach** — the plan
- **Result** — what actually happened, with evidence
- **Next** — what to try next (if any)

**Failed iterations are kept**, not deleted. One file per *iteration*, not per minute. When closing an issue, the final agent-log entry should reference the shipped commit / PR.

**Subfolders for long-running issues.** Once a flat `agent-log/` outgrows itself (~20+ entries), group iterations into folders by phase or angle: `agent-log/exploration/`, `agent-log/implementation/`, `agent-log/benchmarks/`. A second level is available for deeper splits (`agent-log/implementation/round-2/`) — but use it sparingly; if a sub-subgroup needs a third level, that's a sign to split the issue, not nest deeper. Sequence numbers reset per leaf folder.

---

## 6. Searching & indexing

### Default search scope

Per AI rule #2: search `open` + `review` only unless told otherwise.

### Do not use `Grep` or `find` on the tracker — use `list.mjs`

`list.mjs` is the tuned drop-in replacement. It understands the schema (vocabulary, subtask states, frontmatter, agent-log subgroups), combines structural filters with free-text regex search **in one call**, and returns exact file paths + line numbers + excerpts so you can `Read` precisely. `Grep` only sees text; `list.mjs` sees the schema.

Use `Grep` only for content **outside** the tracker (source code, docs, blog).

This routing rule applies to every natural-language phrase the user might use to ask for tracker content. Recognise these as triggers for `list.mjs`, not `Grep` / `find`:

- search · find · look up · locate · grep · scan · query · lookup
- filter · narrow · restrict · scope · slice · subset
- "issues mentioning X" · "issues about X" · "issues touching X" · "issues that talk about X"
- "show me X-priority Y-status issues" · "list bugs assigned to Z" · "what's in review"
- "where is X discussed in the tracker"

`list.mjs` covers all of these — both pure structural filtering (`--priority high`) and free-text regex (`--search "pattern"`), composable in any combination.

### When to spawn a Haiku subagent

Two patterns, both about keeping the main context lean and pushing bulk reading onto cheap tokens.

**Pattern A — bulk classification across many issues.** When the task requires reading **>10 issue files** to summarise / classify:

```
Read all issues under data/todo/ with status:open.
For each, return: id, title, priority, top blocker (1 sentence).
Output as a markdown table. Under 300 words.
```

**Pattern B — chain `list.mjs --search` into a subagent for synthesis.** When `list.mjs --search` returns more than ~10 matches (especially across multiple issues), don't `Read` each file in the main context. Hand the path list straight to a Haiku subagent with the question:

```
1. Run: docs-list \
        --search "indexer" --paths-only --quiet-tips
2. Read each path returned. For each, extract: file, surrounding context
   (3-5 lines around the match), and why it's relevant to <user's question>.
3. Group findings by issue. Synthesise into <≤300 words> answering
   <user's question>.
```

This is the canonical "search → gather → synthesise" pipeline: `list.mjs` does the filtered structural lookup (one tool call), Haiku does the bulk file reads + summarisation (cheap tokens, isolated context), and only the synthesised report flows back into the main conversation.

**Pattern C — pre-stage commands, hand to Haiku for execution.** When you (the main agent) already have the skill loaded and know exactly which scripts/paths solve the user's question, don't run the commands yourself — write them out, hand them to a Haiku subagent to execute and synthesise. The subagent never loads the skill, never explores the project, just runs what you gave it. Validated against the multi-task benchmark: ~17% faster than a Sonnet subagent that loaded the skill itself, ~25% fewer tool uses, and Haiku tokens are ~4-5× cheaper than Sonnet so the cost gap is much larger than the token gap. Useful any time you can write the exact commands without exploration — duplicate-checks, audits, "summarise these 5 specific issues," running pre-known scripts.

```
**Do NOT load any skill.** Run the staged commands below, read targeted files,
synthesise. Read-only.

### TaskA — <name>
```
docs-list \
  --status open,review --search "indexer" --quiet-tips
```
Output format: <what the user expects>.

### TaskB — <name>
… (one section per task, with the exact bash you want it to run)
```

Limits: only works when *you* know the commands — open-ended exploration ("what's interesting in the tracker?") still wants Pattern A or just a normal subagent. Watch out for: Haiku may not dedupe multi-line script output by issue id (T2 of the benchmark hit this), and any path you stage must actually exist or Haiku will burn tokens on guessing.

**When to reach for Pattern C by default.** Default to Pattern C any time you can write the exact `list.mjs` / `subtasks.mjs` / `show.mjs` invocation upfront and the user wants a synthesised answer rather than the raw output. Open-ended exploration and small one-off lookups stay in the main context — Pattern C has a small fixed handoff cost so a single `list.mjs --priority high` is faster done inline. The breakeven is roughly: more than ~3 reads or more than ~10 hits → Pattern C wins. It's not the only path (A and B each have their niche) — just the default whenever the commands are knowable upfront and the output is bulky.

### Helper scripts — use these, they're the fastest path

The plugin ships 8 CLI wrappers (`docs-list`, `docs-show`, `docs-subtasks`, `docs-agent-logs`, `docs-set-state`, `docs-add-comment`, `docs-add-agent-log`, `docs-review-queue`) on your `PATH`. **Prefer them over hand-rolled grep** — they understand the schema (state vs legacy `done`, component-as-array, agent-log subgroups) and emit terse output by default. Each wrapper internally uses `bun` (preferred) with `node` as fallback.

| Script | What it does |
|---|---|
| `list.mjs` | Multi-field filter **+ free-text regex search** over the tracker. Returns file paths + line numbers + excerpts. Drop-in replacement for `grep` / `find` over `data/todo/`. Default scope: open + review. |
| `show.mjs` | Print one issue's metadata + subtask state summary + comment & agent-log heads. `--full` for bodies. |
| `subtasks.mjs` | List subtasks for one issue, or across all issues with `--all`. Default state: open + review. |
| `agent-logs.mjs` | Print the last N agent-log entries (default 3) — for catching up before resuming work. |
| `set-state.mjs` | Update issue status (`settings.json`) or subtask state (frontmatter). Path-allow-listed to the project's content root (resolved from `.env`). Subtask flips also sync `done:`. |
| `add-comment.mjs` | Append a comment with auto-incremented `NNN_` prefix. |
| `add-agent-log.mjs` | Append an agent-log entry with auto-incremented iteration. Supports `--group` for subgroups. |
| `review-queue.mjs` | List items needing review — `status: review` issues + `open` issues with `review` subtasks. |

Common usage:

```bash
# Open issues with high/urgent priority
docs-list --priority high,urgent

# Find all issues mentioning "indexer" (regex search across body, subtasks, comments, notes, agent-logs)
docs-list --search "indexer"

# Combine structural filter + free-text search in one call
docs-list \
  --priority high --search "yjs|crdt" --search-fields body,subtasks

# Issues created since April 1st with at least one review-state subtask
docs-list \
  --created-after 2026-04-01 --has-review-subtasks

# High-priority work nobody's picked up (coarse "unassigned" pseudo-value)
docs-list \
  --assignee unassigned --priority high,urgent

# In-flight work with open subtasks left ("assigned" mirrors "unassigned")
docs-list \
  --assignee assigned --has-open-subtasks

# What is sid working on right now (per-person fine filter)
docs-list --assignee sid

# Anything overdue this week
docs-list --due-before 2026-05-02

# Just the matching paths (pipe into Read or another tool)
docs-list --search "TODO" --paths-only

# Every review-state subtask across the tracker (cross-issue)
docs-subtasks --all --state review

# One issue end-to-end (metadata + subtask state + log heads)
docs-show 2026-04-19-docs-phase-2

# Catch up on prior iterations before resuming work
docs-agent-logs 2026-04-19-docs-phase-2 --last 5

# Mark a subtask done
docs-set-state 2026-04-19-foo/subtasks/02_bar.md closed

# Mark an issue ready for human review
docs-set-state 2026-04-19-foo review

# Append an agent-log entry
docs-add-agent-log 2026-04-19-foo \
  --status success --body "Goal: …  Approach: …  Result: …  Next: —"

# What's awaiting human review?
docs-review-queue
```

Each script supports `--help` (full options), `--json` (machine-readable), and `--tracker <path>` (operate on a non-default tracker). `list.mjs --search` auto-picks the fastest backend (rg → grep → pure JS); pass `--quiet-tips` if the install hint becomes noise.

---

## 7. Writing — how to update the tracker

### Before creating any new issue or subtask — check for duplicates when context is thin

Judgment call up front: **if you have warm context on the area, skip the check; if you don't, run it.** When you've been working in `2026-04-19-docs-phase-2` for several turns and the user asks for "a subtask to fix the X bug," you already know nothing else covers it — creating without a search is fine. Fresh conversation, an unfamiliar component, or a topic that's plausibly been touched before — run the check. The cost of a duplicate is high (split comments, split agent-logs, the next agent picks up the wrong folder, hours of reconciliation); the cost of a `list.mjs --search` is one tool call. When uncertain, default to checking.

The check has three modes depending on how the user phrased the request:

1. **Search by topic / keyword.** Pull two or three salient terms from the user's request — feature names, identifiers, file paths, jargon. Stem to the regex root (e.g. `index|indexer|indexing`).
   ```
   docs-list \
     --search "<root>" --quiet-tips
   ```
2. **Structural check.** When the user names a milestone, component, or person, also filter on it:
   ```
   docs-list \
     --component live-editor --milestone phase-2 --quiet-tips
   ```
3. **Subtask check before adding to a known issue.** When adding into an issue you don't have warm context on:
   ```
   docs-subtasks <issue-id> --quiet-tips
   ```
   Skim titles + states. If the work overlaps an existing subtask, surface that to the user instead of duplicating.

#### Decision tree after the search

- **No hits** → proceed with creation. Move on.
- **Strong match (same scope, similar title, open or review state)** → **don't create**. Tell the user: "This looks like it overlaps with `<id>` — want me to (a) extend that issue with a new subtask, (b) add a comment there, or (c) create the new one anyway?" Wait for the call.
- **Partial match (related but distinct)** → create the new item but **link to the related ones** in the body (e.g. "Related: `2026-04-19-site-wide-search/subtasks/05_ai-search-api.md` — covers the upstream HTTP API; this is the offline fallback"). Surface the relationship to the user in your reply.
- **Closed / cancelled match** → usually fine to proceed; mention the prior closed issue in the body if it's load-bearing context.

The goal isn't to block you — it's to make sure the create is *informed*. Three paths after the search (proceed clean / proceed with link / hand back to user) keep the loop short.

#### Run the check itself via Pattern C

When the duplicate-check fires, don't burn main-context tokens reading raw script output and hit-list files. Stage the `list.mjs` (and `subtasks.mjs` if relevant) commands plus the user's request, hand the bundle to a Haiku subagent, and let it return a 2-4 sentence verdict. This is the same Pattern C from §6 — just specialised for the "is anything related already there?" question.

Handoff template:

```
The user wants to create a subtask: "<one-line summary>". Run these checks
and report whether anything related already exists. ≤4 sentences.

1. docs-list \
     --search "<keyword-roots>" --quiet-tips
2. docs-list \
     --component <c> --milestone <m> --quiet-tips
3. docs-subtasks \
     <issue-id> --quiet-tips   (if a target issue is named)

For any hit that looks related, read the file and quote the most relevant
2-3 lines so the calling agent can see the overlap without re-reading.
Report shape:
  STATUS: <none | strong | partial | closed-only>
  RELATED:
    - <id>/<file>:<line> — <quoted snippet>
  NOTES: <1-2 sentences if needed>
```

The verdict drops into the four-branch decision tree above without you ever loading the hits into main context.

### Create a new subtask

1. **If your context on this area is thin, run the duplicate check above.** If the search returns an existing subtask covering the same work, tell the user instead of creating.
2. Find the next prefix: `ls <issue>/subtasks/` → use `NN+1`
3. Write `<issue>/subtasks/NN_<slug>.md` with the standard frontmatter (`title`, `done: false`, `state: open`)
4. Body: enough detail to pick up cold; if a related issue/subtask turned up in the duplicate check, link to it in a "Related:" line

### Update a subtask state

Direct file write:
```yaml
---
title: "..."
done: true
state: review
---
```

Or via the editor API if running locally: `POST /__editor/subtask-toggle`. The skill should prefer **direct file writes** unless the user explicitly asks to use the editor API.

### Add a comment

1. Find the next prefix: `ls <issue>/comments/`
2. Write `<issue>/comments/NN_<slug>.md` (or `NN_<date>_<author>.md`)
3. Frontmatter: `author`, `date` (today, YYYY-MM-DD)

### Add a note

Notes are freeform supporting docs — pick a meaningful filename, no `NNN_` prefix needed, no required frontmatter beyond an optional `title`.

1. Decide where it lives:
   - Single design doc → `<issue>/notes/<slug>.md`
   - Part of a themed set → `<issue>/notes/<group>/<slug>.md` (e.g. `notes/design/overview.md`)
   - Sub-phase of a themed set → `<issue>/notes/<group>/<subgroup>/<slug>.md` (e.g. `notes/design/phase-1/kickoff.md`)
2. Two levels is the cap. If you find yourself reaching for a third, rethink — usually that's a sign to split into a sibling group or a new issue.
3. Write the file. Folder names are freeform; the loader creates the tree from whatever it finds.

### Add an agent-log entry

Prefer the helper:

```bash
# Top-level entry
docs-add-agent-log <issue-id> \
  --status success --body "Goal: …  Approach: …  Result: …  Next: —"

# Nested under a 1-level subgroup
docs-add-agent-log <issue-id> --group exploration \
  --status success --body "..."

# Nested two levels deep (the deepest the loader accepts)
docs-add-agent-log <issue-id> --group exploration/phase-1 \
  --status success --body "..."
```

`--group` accepts up to 2 slash-separated segments (e.g. `--group exploration` or `--group exploration/phase-1`). The script auto-creates the folder, auto-increments iteration / sequence within the leaf folder, and writes valid frontmatter.

Direct file write (when the helper isn't available):

1. Pick the target folder — `<issue>/agent-log/` for a top-level entry, or up to two levels deep (`<issue>/agent-log/<group>/[<subgroup>/]`).
2. Find the next prefix in that folder: `ls <target-folder>/`. The `NNN_` prefix is **optional** but recommended for sortability and so the iteration counter survives.
3. Write `<target-folder>/NN_<slug>.md`.
4. Frontmatter: `iteration` (next int), `agent` (model id), `status` (in-progress | success | failed), `date`.
5. Body: Goal → Approach → Result → Next.

### When NOT to edit

- Don't touch `closed` / `cancelled` issues without an explicit human prompt
- Don't rewrite history in `comments/` or `agent-log/` — append, don't edit prior entries
- Don't change `author` or `date` on someone else's comment

---

## 8. Worked example — picking up an issue

```
1. Agent gets a prompt: "work on issue 2026-04-19-docs-phase-2"

2. Read the issue end-to-end:
   - cat <issue>/settings.json                 ← metadata
   - cat <issue>/issue.md                      ← goal / context
   - ls <issue>/subtasks/                      ← list of work items
   - ls <issue>/comments/                      ← any recent discussion
   - ls <issue>/agent-log/                     ← prior iterations

3. Read agent-log entries (cheap with grep / Haiku subagent if many):
   - What did past iterations try?
   - What failed?
   - Where did the last iteration leave off?

4. Pick the next subtask (state:open with the lowest prefix), or the
   one the user named. Read it.

5. Do the work. As each subtask completes, update its state:
     state: open → state: review

6. After working: append an agent-log entry summarising
   Goal / Approach / Result / Next.

7. If ALL subtasks are now review or closed:
     Update issue settings.json: status: review
     Hand off to human.

8. Human flips status: review → closed.
   Next pickup writes a closing agent-log entry referencing the shipped state.
```

---

## 9. Cross-references

- `@root/default-docs/data/user-guide/19_issues/` (the framework's bundled user-guide) — full section
- `@root/default-docs/data/user-guide/19_issues/06_lifecycle-and-review.md` — deep dive on the 4-state model
- `@root/default-docs/data/user-guide/19_issues/09_using-with-ai.md` — agent-facing rules
- `@root/default-docs/data/user-guide/19_issues/04_settings/02_vocabulary.md` — tracker vocabulary spec
- `2025-06-25-claude-skills/subtasks/02_issues-skill.md` — internal spec for this reference + planned helper scripts
