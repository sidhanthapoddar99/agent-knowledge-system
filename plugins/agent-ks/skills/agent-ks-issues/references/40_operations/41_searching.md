# Searching & indexing the tracker

## Default search scope

Per AI rule #3 ([00_overview.md](../00_anatomy/00_overview.md#ai-rules--the-most-important-rules-in-the-whole-skill)): search everything **not** Closed. The Closed category (`done`, `dropped`, `superseded`) stays hidden unless told otherwise.

> [!WARNING]
> **The default scope silently hides the Closed category.** Every `agent-ks issue list` query — structural filter, `--search`, `--path`, `--meta` — runs against the non-closed statuses only. A query can come back empty while a matching issue sits in `done`, `dropped` or `superseded`. **"Not found" in the default scope is not "doesn't exist."** This is the single most common way a tracker lookup goes wrong.
>
> `agent-ks issue list` guards against this: when a query matches issues the default scope hid, it prints a one-line **tip to stderr** with the count and breakdown:
>
> ```
> tip: showing active only — 1 more issue(s) match in 1 dropped. Add --status all (or --include-closed) to include them.
> ```
>
> When you see that tip, or any time the answer hinges on "does this issue exist at all", **re-run with `--status all`** or `--include-closed`. `agent-ks find` is status-agnostic and never hides anything. Suppress the tip with `--quiet-tips` only when you have deliberately scoped the search.

## Do not use `Grep` or `find` on the tracker — use `agent-ks issue list`

`agent-ks issue list` understands the schema (vocabulary, subtask statuses, frontmatter, agent-log subgroups), combines structural filters with free-text regex **in one call**, and returns exact file paths + line numbers + excerpts so you can `Read` precisely. `Grep` only sees text. Use `Grep` only for content **outside** the tracker.

Recognise these phrasings as triggers for `agent-ks issue list`: search · find · look up · locate · grep · scan · query · filter · narrow · scope · "issues mentioning X" · "issues about X" · "show me X-priority Y-status issues" · "list bugs assigned to Z" · "what's in review" · "where is X discussed in the tracker".

Every command and flag is in [cli-toolkit.md](../../../agent-ks-docs/references/cli-toolkit.md); `agent-ks help` is the live list. Every command takes `--help`, `--json`, and `--tracker <path>` for a non-default tracker. **Every wrapper requires `bun`** — the dispatcher refuses with an install hint otherwise. Scaffolders take the issue id positionally: `agent-ks issue new-plan <issue-id> --name <slug>`.

Common usage:

```bash
# Open issues with high/urgent priority
agent-ks issue list --priority high,urgent

# Find all issues mentioning "indexer" (regex across body, subtasks, comments, notes, agent-logs)
agent-ks issue list --search "indexer"

# Combine structural filter + free-text search in one call
agent-ks issue list --priority high --search "yjs|crdt" --search-fields body,subtasks

# High-priority work nobody's picked up (coarse "unassigned" pseudo-value)
agent-ks issue list --assignee unassigned --priority high,urgent

# What is sid working on right now (per-person fine filter)
agent-ks issue list --assignee sid

# Just the matching paths (pipe into Read or another tool)
agent-ks issue list --search "TODO" --paths-only

# Scope the search by LEVEL, not just text:
agent-ks issue list --path "astro" --status all   # match by file/folder PATH text (no content scan)
agent-ks issue list --meta "priority: high"       # match only frontmatter + JSON, not prose
agent-ks issue list --search "yjs" --count        # match counts + titles only

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

### Search-scoping flags — depth, not just text

`agent-ks issue list` (and the cross-content `agent-ks find`) take three flags that restrict *where* a regex matches:

- `--path <regex>` — match the file/folder **path text** only (no content scan). The fast way to locate an issue by slug. Pair with `--status all` when the issue may be closed.
- `--meta <regex>` — match only the **structured layer**: frontmatter on `.md` files + whole `.json`/`.yaml` files. Use for a field value, not prose mentions.
- `--count` — print match counts + titles only. Pairs with a broad `--search` to gauge breadth before drilling in.

### Searching across ALL content types — `agent-ks find`

`agent-ks issue list` is tracker-scoped and schema-aware. For a string **anywhere across every content type at once** (docs + blog + issues + config), use `agent-ks find <regex>`. It honors the same scoping flags plus `--type docs,blog,issues,config`.

## When to spawn a Haiku subagent

This is the one home for the subagent patterns; the skills and other references point here. All three keep the main context lean by pushing bulk reading onto cheap tokens.

**Pattern A — bulk classification across many issues.** When the task requires reading **>10 issue files** to summarise or classify:

```
Read all issues under data/todo/ with status:open.
For each, return: id, title, priority, top blocker (1 sentence).
Output as a markdown table. Under 300 words.
```

**Pattern B — chain `agent-ks issue list --search` into a subagent for synthesis.** When a search returns more than ~10 matches, don't `Read` each file in the main context. Hand the path list to a Haiku subagent with the question:

```
1. Run: agent-ks issue list --search "indexer" --paths-only --quiet-tips
2. Read each path returned. For each, extract: file, surrounding context
   (3-5 lines around the match), and why it's relevant to <user's question>.
3. Group findings by issue. Synthesise into <≤300 words> answering <user's question>.
```

**Pattern C — pre-stage commands, hand to Haiku for execution.** When you already know exactly which commands solve the question, write them out and hand them to a Haiku subagent to execute and synthesise. The subagent never loads the skill and never explores. Measured on the multi-task benchmark: ~17% faster than a Sonnet subagent that loaded the skill, ~25% fewer tool uses, and Haiku tokens are ~4–5× cheaper.

```
**Do NOT load any skill.** Run the staged commands below, read targeted files,
synthesise. Read-only.

### TaskA — <name>
agent-ks issue list --search "indexer" --quiet-tips
Output format: <what the user expects>.

### TaskB — <name>
… (one section per task, with the exact bash you want it to run)
```

**Default to Pattern C** any time you can write the exact invocation upfront and the user wants a synthesised answer. Breakeven: more than ~3 reads or more than ~10 hits. Open-ended exploration and small one-off lookups stay in the main context. Any path you stage must actually exist, or Haiku burns tokens guessing.
