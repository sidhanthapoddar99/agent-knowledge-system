# Searching & indexing the tracker

## Default search scope

Per AI rule #3 (see [00_overview.md](../00_anatomy/00_overview.md)): search everything **not** closed — the Closed category (`done`/`dropped`) stays hidden — unless told otherwise.

> [!WARNING]
> **The default scope silently hides the Closed category (`done` and `dropped`).** Every `agent-ks issue list` query — structural filter, `--search`, `--path`, `--meta` — runs against the non-closed statuses only. So a query can come back empty (or look complete) while a matching issue sits in `done`/`dropped`. **"Not found" in the default scope is not "doesn't exist."** This is the single most common way a tracker lookup goes wrong — e.g. hunting a *dropped* upgrade issue by slug and concluding it was never filed.
>
> `agent-ks issue list` guards against this for you: when a query matches issues that the default scope hid, it prints a one-line **tip to stderr** with the count and breakdown, e.g.
>
> ```
> tip: showing active only — 1 more issue(s) match in 1 dropped. Add --status all (or --include-closed) to include them.
> ```
>
> When you see that tip — or any time the answer hinges on "does this issue exist at all" — **re-run with `--status all`** (every status) or `--include-closed` (default scope + the Closed category). `agent-ks find` is status-agnostic and never hides anything, so it's the other safe fallback. Suppress the tip with `--quiet-tips` only when you've deliberately scoped the search.

## Do not use `Grep` or `find` on the tracker — use `agent-ks issue list`

`agent-ks issue list` (the `list.mjs` wrapper) is the tuned drop-in replacement. It understands the schema (vocabulary, subtask statuses, frontmatter, agent-log subgroups), combines structural filters with free-text regex search **in one call**, and returns exact file paths + line numbers + excerpts so you can `Read` precisely. `Grep` only sees text; `agent-ks issue list` sees the schema.

Use `Grep` only for content **outside** the tracker (source code, docs, blog).

This routing rule applies to every natural-language phrase the user might use. Recognise these as triggers for `agent-ks issue list`, not `Grep` / `find`:

- search · find · look up · locate · grep · scan · query · lookup
- filter · narrow · restrict · scope · slice · subset
- "issues mentioning X" · "issues about X" · "issues touching X" · "issues that talk about X"
- "show me X-priority Y-status issues" · "list bugs assigned to Z" · "what's in review"
- "where is X discussed in the tracker"

`agent-ks issue list` covers all of these — both pure structural filtering (`--priority high`) and free-text regex (`--search "pattern"`), composable in any combination.

## Helper scripts — use these, they're the fastest path

The plugin ships 8 issue-tracker CLI wrappers (`agent-ks issue list`, `agent-ks issue show`, `agent-ks issue subtasks`, `agent-ks issue agent-logs`, `agent-ks issue set-state`, `agent-ks issue add-comment`, `agent-ks issue add-agent-log`, `agent-ks issue review-queue`) on your `PATH`. **Prefer them over hand-rolled grep** — they understand the schema (subtask `status`, component-as-array, agent-log subgroups) and emit terse output by default. Each wrapper internally uses `bun` (preferred) with `node` as fallback.

| Command (script) | What it does |
|---|---|
| `agent-ks issue list` (`list.mjs`) | Multi-field filter **+ free-text regex search**. Returns paths + line numbers + excerpts. Drop-in replacement for `grep` / `find` over `data/todo/`. Default scope: non-closed (hides `done`/`dropped`). |
| `agent-ks issue show` (`show.mjs`) | Print one issue's metadata + subtask status summary + comment & agent-log heads. `--full` for bodies. |
| `agent-ks issue subtasks` (`subtasks.mjs`) | List subtasks for one issue, or across all with `--all`. Default: grouped tree (mirrors the 2-level folders). `--flat` for one-line-per-subtask. Default scope: non-closed (hides `done`/`dropped`). |
| `agent-ks issue agent-logs` (`agent-logs.mjs`) | Print the last N agent-log entries (default 3) — catch up before resuming work. |
| `agent-ks issue set-state` (`set-state.mjs`) | Update issue status (`settings.json`) or subtask status (frontmatter). Path-allow-listed to the content root. |
| `agent-ks issue add-comment` (`add-comment.mjs`) | Append a comment with auto-incremented `NNN_` prefix. |
| `agent-ks issue add-agent-log` (`add-agent-log.mjs`) | Append an agent-log entry with auto-incremented iteration. Supports `--group` for subgroups. |
| `agent-ks issue review-queue` (`review-queue.mjs`) | List items needing review — issues in the **Review category** (`review` / `input-needed`) + active (non-closed) issues with a Review-category subtask. |

Common usage:

```bash
# Open issues with high/urgent priority
agent-ks issue list --priority high,urgent

# Find all issues mentioning "indexer" (regex search across body, subtasks, comments, notes, agent-logs)
agent-ks issue list --search "indexer"

# Combine structural filter + free-text search in one call
agent-ks issue list --priority high --search "yjs|crdt" --search-fields body,subtasks

# Issues created since April 1st with at least one review-status subtask
agent-ks issue list --created-after 2026-04-01 --has-review-subtasks

# High-priority work nobody's picked up (coarse "unassigned" pseudo-value)
agent-ks issue list --assignee unassigned --priority high,urgent

# What is sid working on right now (per-person fine filter)
agent-ks issue list --assignee sid

# Just the matching paths (pipe into Read or another tool)
agent-ks issue list --search "TODO" --paths-only

# Scope the search by LEVEL, not just text:
agent-ks issue list --path "astro"            # match issues by file/folder PATH text (no content scan)
agent-ks issue list --meta "priority: high"   # match only the structured layer (frontmatter + JSON), not prose
agent-ks issue list --search "yjs" --count    # match counts + titles only, skip the per-line excerpt dump

# Every review-status subtask across the tracker (cross-issue, grouped tree)
agent-ks issue subtasks --all --status review

# One issue end-to-end (metadata + subtask status + log heads)
agent-ks issue show 2026-04-19-docs-phase-2

# Catch up on prior iterations before resuming work
agent-ks issue agent-logs 2026-04-19-docs-phase-2 --last 5

# Set a subtask in-progress, then hand the issue off for review
agent-ks issue set-state 2026-04-19-foo in-progress --subtask 02
agent-ks issue set-state 2026-04-19-foo review

# What's awaiting human review?
agent-ks issue review-queue
```

Each script supports `--help` (full options), `--json` (machine-readable), and `--tracker <path>` (operate on a non-default tracker). `agent-ks issue list --search` auto-picks the fastest backend (rg → grep → pure JS); pass `--quiet-tips` if the install hint becomes noise.

### Search-scoping flags — depth, not just text

`agent-ks issue list` (and the cross-content `agent-ks find`) take three flags that restrict *where* a regex matches, so a broad query doesn't flood output:

- `--path <regex>` — match the file/folder **path text** only (no content scan). The fast way to locate an issue by slug — e.g. `agent-ks issue list --path astro --status all` finds the astro-upgrade issue in one call (note `--status all`: that issue is *dropped*, so the default non-closed scope would hide it — see the scope warning above).
- `--meta <regex>` — match only the **structured layer**: frontmatter on `.md` files + whole `.json`/`.yaml` files. Use when you want a field value (`priority: high`, a label, a component) and not prose mentions.
- `--count` — print match counts + titles only, suppressing the per-line excerpt dump. Pairs well with a broad `--search` to gauge breadth before drilling in.

### Searching across ALL content types — `agent-ks find`

`agent-ks issue list` is tracker-scoped and schema-aware. When you need a string **anywhere across every content type at once** (docs + blog + issues + config), use `agent-ks find <regex>` — one schema-agnostic engine over all of `data/` + `config/`. It honors the same scoping flags (`--path`, `--meta`, `--count`, `--paths-only`) plus `--type docs,blog,issues,config` to narrow scope. The per-type schema-aware peers (`agent-ks doc search`, `agent-ks blog search`) answer "find the page/post about X"; `agent-ks find` answers "where is this string, anywhere".

## When to spawn a Haiku subagent

Two ideas, both about keeping the main context lean and pushing bulk reading onto cheap tokens.

**Pattern A — bulk classification across many issues.** When the task requires reading **>10 issue files** to summarise / classify:

```
Read all issues under data/todo/ with status:open.
For each, return: id, title, priority, top blocker (1 sentence).
Output as a markdown table. Under 300 words.
```

**Pattern B — chain `agent-ks issue list --search` into a subagent for synthesis.** When `agent-ks issue list --search` returns more than ~10 matches (especially across multiple issues), don't `Read` each file in the main context. Hand the path list straight to a Haiku subagent with the question:

```
1. Run: agent-ks issue list --search "indexer" --paths-only --quiet-tips
2. Read each path returned. For each, extract: file, surrounding context
   (3-5 lines around the match), and why it's relevant to <user's question>.
3. Group findings by issue. Synthesise into <≤300 words> answering <user's question>.
```

This is the canonical "search → gather → synthesise" pipeline: `agent-ks issue list` does the filtered structural lookup (one tool call), Haiku does the bulk file reads + summarisation (cheap tokens, isolated context), and only the synthesised report flows back.

**Pattern C — pre-stage commands, hand to Haiku for execution.** When you (the main agent) already have the skill loaded and know exactly which scripts/paths solve the question, don't run the commands yourself — write them out, hand them to a Haiku subagent to execute and synthesise. The subagent never loads the skill, never explores the project, just runs what you gave it. Validated against the multi-task benchmark: ~17% faster than a Sonnet subagent that loaded the skill itself, ~25% fewer tool uses, and Haiku tokens are ~4–5× cheaper. Useful any time you can write the exact commands without exploration — duplicate-checks, audits, "summarise these 5 specific issues."

```
**Do NOT load any skill.** Run the staged commands below, read targeted files,
synthesise. Read-only.

### TaskA — <name>
agent-ks issue list --search "indexer" --quiet-tips
Output format: <what the user expects>.

### TaskB — <name>
… (one section per task, with the exact bash you want it to run)
```

**When to reach for Pattern C by default.** Default to Pattern C any time you can write the exact `agent-ks issue list` / `agent-ks issue subtasks` / `agent-ks issue show` invocation upfront and the user wants a synthesised answer rather than raw output. The breakeven is roughly: more than ~3 reads or more than ~10 hits → Pattern C wins. Open-ended exploration ("what's interesting in the tracker?") and small one-off lookups stay in the main context. Watch out: Haiku may not dedupe multi-line script output by issue id, and any path you stage must actually exist or Haiku will burn tokens guessing.
