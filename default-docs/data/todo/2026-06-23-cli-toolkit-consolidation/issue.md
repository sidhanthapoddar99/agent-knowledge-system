## Goal

Consolidate and extend the `documentation-guide` plugin's CLI toolkit (the 13 `docs-*` wrappers) so that **listing, showing, and searching content work uniformly across all content types** — docs, blog, and issues — instead of being concentrated on the issue tracker.

## What prompted this

While searching the tracker for the Astro-upgrade issue, a broad `docs-list --search "astro"` produced 38 KB of full-text matches (truncated to a 2 KB preview), so the relevant issue was missed and the search fell back to `git log --grep`. The toolkit *had* the right scopes (`--search-fields`, `--limit`, `--scope`) but the failure exposed two real gaps:

1. **No way to search just the title / path / metadata layer** — only full-text or coarse field buckets.
2. **`docs-list` and its search engine are issues-only.** Docs and blog have no `list` / `show` / `search` wrapper at all — for those you fall back to plain `Grep`.

## Scope

- **`notes/01_feature-matrix.md`** — **PRE-EDIT (frozen baseline)** feature matrix: four category tables (0 shared contract · 1 common code · 2 common-name/type-specific · 3 type-specific) scored against today's state. Exposes the gaps and orphaned commands.
- **`notes/02_current-architecture.md`** — how the CLI is wired today (`bin/` shims → `cli.mjs` `COMMANDS` map → domain-foldered scripts) and why a refactor is cheap (routing lives in one place).
- **`notes/03_refactor-approach.md`** — original priority framing (superseded/expanded by 04).
- **`notes/04_cli-landscape-and-category-0.md`** — full landscape map, the **Category 0** shared contract + `help`/discovery, the manifest approach, the `git` command, and Windows/Python notes.
- **`notes/05_post-edit-feature-matrix.md`** — **POST-EDIT placeholder**, recreated with shipped values as the final loop step.

## Status

**Planned — ready to execute via a `/loop`.** Findings are settled and the work is fully decomposed into **18 subtasks**. The naming model (subtask 01) is the one open gate, to be decided in-loop before the per-type commands. The loop scaffold lives in `agent-log/200_loops/010_cli-consolidation/` (goal + testing methodology + live task-list); durable facts in `agent-log/000_agent-memory/`.

## Key findings up front

- The refactor is **low-risk**: command→script routing is a single 13-line `COMMANDS` map in `cli.mjs`; scripts are already organized by domain folder (`issues/`, `blog/`, `docs/`, `config/`, `images/`); shims self-route by filename. Renames don't ripple into the JS.
- **Orphaned command:** `scripts/issues/check.mjs` exists but is **not** in the `COMMANDS` map — there is no `docs-check-issues` bin. Issues are the only content type with no validator wired.
