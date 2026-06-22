# Updating the tracker — cross-cutting flow

This file covers the flow that spans sub-doc types: checking for duplicates, creating a brand-new issue, validating after writes, and when *not* to edit. **Per-type write recipes live with their content file** (see the table at the bottom).

## Before creating any new issue or subtask — check for duplicates when context is thin

Judgment call up front: **if you have warm context on the area, skip the check; if you don't, run it.** When you've been working in `2026-04-19-docs-phase-2` for several turns and the user asks for "a subtask to fix the X bug," you already know nothing else covers it — creating without a search is fine. Fresh conversation, an unfamiliar component, or a topic that's plausibly been touched before — run the check. The cost of a duplicate is high (split comments, split agent-logs, the next agent picks up the wrong folder); the cost of a `docs-guide issue list --search` is one tool call. When uncertain, default to checking.

The check has three modes depending on how the user phrased the request:

1. **Search by topic / keyword.** Pull two or three salient terms — feature names, identifiers, file paths, jargon. Stem to the regex root (e.g. `index|indexer|indexing`).
   ```
   docs-guide issue list --search "<root>" --quiet-tips
   ```
2. **Structural check.** When the user names a component, priority, or person, also filter on it:
   ```
   docs-guide issue list --component live-editor --priority high,urgent --quiet-tips
   ```
3. **Subtask check before adding to a known issue:**
   ```
   docs-guide issue subtasks <issue-id> --quiet-tips
   ```
   Skim titles + states. If the work overlaps an existing subtask, surface that instead of duplicating.

### Decision tree after the search

- **No hits** → proceed with creation. Move on.
- **Strong match (same scope, similar title, open or review state)** → **don't create**. Tell the user: "This looks like it overlaps with `<id>` — want me to (a) extend that issue with a new subtask, (b) add a comment there, or (c) create the new one anyway?" Wait for the call.
- **Partial match (related but distinct)** → create the new item but **link to the related ones** in the body (e.g. "Related: `…/subtasks/05_ai-search-api.md` — covers the upstream HTTP API; this is the offline fallback"). Surface the relationship in your reply.
- **Closed / cancelled match** → usually fine to proceed; mention the prior closed issue in the body if it's load-bearing context.

### Run the check itself via Pattern C

When the duplicate-check fires, don't burn main-context tokens reading raw script output. Stage the `docs-guide issue list` (and `docs-guide issue subtasks` if relevant) commands plus the user's request, hand the bundle to a Haiku subagent (Pattern C in [41_searching.md](41_searching.md)), and let it return a 2–4 sentence verdict.

```
The user wants to create a subtask: "<one-line summary>". Run these checks
and report whether anything related already exists. ≤4 sentences.

1. docs-guide issue list --search "<keyword-roots>" --quiet-tips
2. docs-guide issue list --component <c> --priority <p> --quiet-tips
3. docs-guide issue subtasks <issue-id> --quiet-tips   (if a target issue is named)

For any related hit, read the file and quote the most relevant 2-3 lines.
Report shape:
  STATUS: <none | strong | partial | closed-only>
  RELATED:
    - <id>/<file>:<line> — <quoted snippet>
  NOTES: <1-2 sentences if needed>
```

The verdict drops into the four-branch decision tree above without you ever loading the hits into main context.

## Create a new issue

1. Run the duplicate check above if context is thin.
2. Create the folder: `<tracker>/<YYYY-MM-DD>-<kebab-slug>/` (today's date + a short slug).
3. Write `settings.json` with all required fields (`title`, `status: open`, `priority`, `component`, `labels`, `author`, `assignees`) — all enum values must come from the tracker vocabulary ([03_vocabulary.md](03_vocabulary.md)).
4. Write `issue.md` — goal, context, success criteria ([20_issue-md.md](20_issue-md.md)).
5. If it's an AI-handoff-bound issue, declare ≥1 subtask ([23_subtasks.md](23_subtasks.md)).
6. Validate (below).

## Validating after writes

Run the validator after any non-trivial write to confirm the tracker still parses and no unknown keys crept in:

```bash
docs-guide check section <tracker>      # or: bun plugins/.../scripts/issues/check.mjs <tracker>
```

Three optional flags shape the output:

- `--quiet` / `--no-warnings` — suppress all warnings; only errors print.
- `--verbose` — for unknown-key warnings, also list the canonical keys (helps when migrating a tracker upgraded from an older framework version).
- `--strict` — promote unknown-key warnings to errors (exit 1 on schema drift). Use in CI gates and after a migration sweep.

## When NOT to edit

- Don't touch `closed` / `cancelled` issues without an explicit human prompt.
- Don't rewrite history in `comments/` or `agent-log/` — append, don't edit prior entries.
- Don't change `author` or `date` on someone else's comment.
- Don't mark an issue or subtask `closed` — that's a human-only transition (AI rule #1, [00_overview.md](00_overview.md)).

## Per-type write recipes — where they live

Each sub-doc type's own file carries the recipe to add one:

| To add a… | Recipe in |
|---|---|
| comment | [21_comments.md](21_comments.md) |
| note | [22_notes.md](22_notes.md) |
| subtask (create / update state) | [23_subtasks.md](23_subtasks.md) |
| agent-log entry | [24_agent-logs.md](24_agent-logs.md) |

To **move or restructure** existing items (rename, promote a subtask to its own issue, split/merge), see [43_moving-restructuring.md](43_moving-restructuring.md).
