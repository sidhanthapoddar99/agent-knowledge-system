# Searching & indexing the tracker

## Default search scope

Per AI rule #2 (see [00_overview.md](00_overview.md)): search `open` + `review` only unless told otherwise.

## Do not use `Grep` or `find` on the tracker — use `docs-list`

`docs-list` (the `list.mjs` wrapper) is the tuned drop-in replacement. It understands the schema (vocabulary, subtask states, frontmatter, agent-log subgroups), combines structural filters with free-text regex search **in one call**, and returns exact file paths + line numbers + excerpts so you can `Read` precisely. `Grep` only sees text; `docs-list` sees the schema.

Use `Grep` only for content **outside** the tracker (source code, docs, blog).

This routing rule applies to every natural-language phrase the user might use. Recognise these as triggers for `docs-list`, not `Grep` / `find`:

- search · find · look up · locate · grep · scan · query · lookup
- filter · narrow · restrict · scope · slice · subset
- "issues mentioning X" · "issues about X" · "issues touching X" · "issues that talk about X"
- "show me X-priority Y-status issues" · "list bugs assigned to Z" · "what's in review"
- "where is X discussed in the tracker"

`docs-list` covers all of these — both pure structural filtering (`--priority high`) and free-text regex (`--search "pattern"`), composable in any combination.

## Helper scripts — use these, they're the fastest path

The plugin ships 8 issue-tracker CLI wrappers (`docs-list`, `docs-show`, `docs-subtasks`, `docs-agent-logs`, `docs-set-state`, `docs-add-comment`, `docs-add-agent-log`, `docs-review-queue`) on your `PATH`. **Prefer them over hand-rolled grep** — they understand the schema (state vs legacy `done`, component-as-array, agent-log subgroups) and emit terse output by default. Each wrapper internally uses `bun` (preferred) with `node` as fallback.

| Command (script) | What it does |
|---|---|
| `docs-list` (`list.mjs`) | Multi-field filter **+ free-text regex search**. Returns paths + line numbers + excerpts. Drop-in replacement for `grep` / `find` over `data/todo/`. Default scope: open + review. |
| `docs-show` (`show.mjs`) | Print one issue's metadata + subtask state summary + comment & agent-log heads. `--full` for bodies. |
| `docs-subtasks` (`subtasks.mjs`) | List subtasks for one issue, or across all with `--all`. Default: grouped tree (mirrors the 2-level folders). `--flat` for one-line-per-subtask. Default state: open + review. |
| `docs-agent-logs` (`agent-logs.mjs`) | Print the last N agent-log entries (default 3) — catch up before resuming work. |
| `docs-set-state` (`set-state.mjs`) | Update issue status (`settings.json`) or subtask state (frontmatter). Path-allow-listed to the content root. Subtask flips also sync `done:`. |
| `docs-add-comment` (`add-comment.mjs`) | Append a comment with auto-incremented `NNN_` prefix. |
| `docs-add-agent-log` (`add-agent-log.mjs`) | Append an agent-log entry with auto-incremented iteration. Supports `--group` for subgroups. |
| `docs-review-queue` (`review-queue.mjs`) | List items needing review — `status: review` issues + `open` issues with `review` subtasks. |

Common usage:

```bash
# Open issues with high/urgent priority
docs-list --priority high,urgent

# Find all issues mentioning "indexer" (regex search across body, subtasks, comments, notes, agent-logs)
docs-list --search "indexer"

# Combine structural filter + free-text search in one call
docs-list --priority high --search "yjs|crdt" --search-fields body,subtasks

# Issues created since April 1st with at least one review-state subtask
docs-list --created-after 2026-04-01 --has-review-subtasks

# High-priority work nobody's picked up (coarse "unassigned" pseudo-value)
docs-list --assignee unassigned --priority high,urgent

# What is sid working on right now (per-person fine filter)
docs-list --assignee sid

# Just the matching paths (pipe into Read or another tool)
docs-list --search "TODO" --paths-only

# Every review-state subtask across the tracker (cross-issue, grouped tree)
docs-subtasks --all --state review

# One issue end-to-end (metadata + subtask state + log heads)
docs-show 2026-04-19-docs-phase-2

# Catch up on prior iterations before resuming work
docs-agent-logs 2026-04-19-docs-phase-2 --last 5

# Mark a subtask done / an issue ready for review
docs-set-state 2026-04-19-foo/subtasks/02_bar.md closed
docs-set-state 2026-04-19-foo review

# What's awaiting human review?
docs-review-queue
```

Each script supports `--help` (full options), `--json` (machine-readable), and `--tracker <path>` (operate on a non-default tracker). `docs-list --search` auto-picks the fastest backend (rg → grep → pure JS); pass `--quiet-tips` if the install hint becomes noise.

## When to spawn a Haiku subagent

Two ideas, both about keeping the main context lean and pushing bulk reading onto cheap tokens.

**Pattern A — bulk classification across many issues.** When the task requires reading **>10 issue files** to summarise / classify:

```
Read all issues under data/todo/ with status:open.
For each, return: id, title, priority, top blocker (1 sentence).
Output as a markdown table. Under 300 words.
```

**Pattern B — chain `docs-list --search` into a subagent for synthesis.** When `docs-list --search` returns more than ~10 matches (especially across multiple issues), don't `Read` each file in the main context. Hand the path list straight to a Haiku subagent with the question:

```
1. Run: docs-list --search "indexer" --paths-only --quiet-tips
2. Read each path returned. For each, extract: file, surrounding context
   (3-5 lines around the match), and why it's relevant to <user's question>.
3. Group findings by issue. Synthesise into <≤300 words> answering <user's question>.
```

This is the canonical "search → gather → synthesise" pipeline: `docs-list` does the filtered structural lookup (one tool call), Haiku does the bulk file reads + summarisation (cheap tokens, isolated context), and only the synthesised report flows back.

**Pattern C — pre-stage commands, hand to Haiku for execution.** When you (the main agent) already have the skill loaded and know exactly which scripts/paths solve the question, don't run the commands yourself — write them out, hand them to a Haiku subagent to execute and synthesise. The subagent never loads the skill, never explores the project, just runs what you gave it. Validated against the multi-task benchmark: ~17% faster than a Sonnet subagent that loaded the skill itself, ~25% fewer tool uses, and Haiku tokens are ~4–5× cheaper. Useful any time you can write the exact commands without exploration — duplicate-checks, audits, "summarise these 5 specific issues."

```
**Do NOT load any skill.** Run the staged commands below, read targeted files,
synthesise. Read-only.

### TaskA — <name>
docs-list --status open,review --search "indexer" --quiet-tips
Output format: <what the user expects>.

### TaskB — <name>
… (one section per task, with the exact bash you want it to run)
```

**When to reach for Pattern C by default.** Default to Pattern C any time you can write the exact `docs-list` / `docs-subtasks` / `docs-show` invocation upfront and the user wants a synthesised answer rather than raw output. The breakeven is roughly: more than ~3 reads or more than ~10 hits → Pattern C wins. Open-ended exploration ("what's interesting in the tracker?") and small one-off lookups stay in the main context. Watch out: Haiku may not dedupe multi-line script output by issue id, and any path you stage must actually exist or Haiku will burn tokens guessing.
