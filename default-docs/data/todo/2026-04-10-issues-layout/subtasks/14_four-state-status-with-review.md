---
title: "4-state status (open / review / closed / cancelled) for issues and subtasks"
status: done
---

Replace the binary subtask `done: bool` with a 4-state status that mirrors the issue-level status vocabulary, and add `review` as a first-class status everywhere.

## Why this change exists

See [notes/02_design-philosophy-and-review-state.md](../notes/02_design-philosophy-and-review-state.md) for the full rationale. Short version: in a 1–4 person AI-augmented team, the AI does the work and the human's primary job is *review*. A dedicated state for "AI thinks it's done; human, please confirm" is the missing primitive that unblocks async AI workflows.

## Vocabulary changes

### Issue status

Add `review` to the `status` vocabulary. New values:

```
["open", "review", "closed", "cancelled"]
```

- `review` is its own status, not a flag on top of `open`. An issue is in *exactly* one state at a time.
- AI flips an issue to `review` when it believes the work is complete. Human reviews and either flips to `closed` or back to `open` (with a comment).

### Subtask state

Subtask frontmatter changes from boolean `done` to enum `state`:

```yaml
# Old
---
title: "Foo"
done: true
---

# New
---
title: "Foo"
state: closed   # one of: open | review | closed | cancelled
---
```

Backwards compatibility: the loader honours `done: true` → `state: closed` and `done: false` → `state: open` for one release. New writes always use `state`.

## Visuals — subtask icon

Use semantic theme tokens so themes can override.

| State | Icon | Color | Title style |
|---|---|---|---|
| `open` | empty checkbox outline | `--color-border-default` / `--color-text-muted` | normal |
| `review` | filled dot (●) | `--color-warning` (gold / yellow) | normal |
| `closed` | tick (✓) | `--color-success` (green) | strikethrough + muted |
| `cancelled` | cross (✗) | `--color-error` (red) | strikethrough + muted |

Distinction between `closed` and `cancelled` comes from icon shape AND color — both axes of redundancy for color-blind users.

### Where the icon lives

Three locations:

1. **Sidebar (`.issue-sidebar__check`)** — already uses a custom SVG span; extend to swap SVG based on `data-state`. No accessibility regression.
2. **Overview combined-list (`.issue-overview-subtasks__checkbox`)** — currently a native `<input type="checkbox">`. Replace with a custom `<button>` carrying `role="checkbox"`, `aria-checked`, `data-state`. Space and click cycle through the 4 states (open → review → closed → cancelled → open).
3. **Subtask page header** — handled by [subtask 07](./07_subtask-page-header.md). Drop the inline checkbox entirely; show title + status badge instead. The 4-state button is *not* added here.

## Subtask-toggle endpoint

Existing `POST /__editor/subtask-toggle` is binary. Extend:

- Accept `{ filePath, state: "open" | "review" | "closed" | "cancelled" }` in addition to the legacy `{ filePath, done: bool }` shape
- Read existing frontmatter, set `state`, also remove the legacy `done` field if present
- Return the new state so the client can confirm

Backwards compatibility: client sends `state` for new flows; old `done` writes still parse correctly server-side.

## Index page — `Review` state tab

Add `Review` between `Open` and `Closed`:

```
Open · Review · Closed · Cancelled · All
```

- Review tab shows issues with `status: review`
- Tab pill in `--color-warning` so it draws the eye
- Counts respect active filters (same as today)
- Status column auto-hides on Open / Review / Closed / Cancelled tabs (tab encodes status); reappears on All

## Index table — subtasks column with 4 states

Replace the single-color progress bar with a **stacked 4-segment bar**:

```
[●●●● green | ●● yellow | ● red | ○○ track ]
   closed     review    cancelled  open
```

Header text: `5/8 done` where "done" = closed + cancelled (terminal states). Hover reveals full breakdown (`3 closed · 2 review · 1 cancelled · 2 open`).

## Detail page — sidebar count

Sidebar section heading shows `subtasksDone / subtasksTotal` today. Update so "done" includes both `closed` and `cancelled`. If any subtask is in `review`, show a small yellow dot next to the section heading to draw the human's attention.

## Auto-derive issue status from subtask states (optional, decide later)

Open question: should the issue's status auto-flip to `review` if any subtask is in `review`? Or stay manual?

Recommendation: **soft auto-derive** — if the user hasn't explicitly set issue status to `review`/`closed`/`cancelled`, and any subtask is in `review`, surface a "Subtasks awaiting review" indicator on the issue but don't change the actual status field. Keeps human control while making review-debt visible.

## Migration plan

1. Update vocabulary in `dynamic_data/data/todo/settings.json`
2. Update loader (`src/loaders/issues.ts`) — accept both `done` and `state`, emit `state`
3. Update subtask-toggle endpoint
4. Update sidebar SVG (4 cases)
5. Replace overview-list native checkbox with custom 4-state button
6. Add Review state tab + table column auto-hide rule
7. Update IssuesTable subtasks cell to render 4-segment bar
8. No data migration needed — existing subtasks with `done: true` keep working via the loader's compat layer

## Out of scope

- Click-cycle vs explicit-button choice for the 4-state button — going with **click cycles** for simplicity (4 states is few enough that cycling is fine; right-click can be added later if needed)
- Auto-deriving issue status from subtask state — see "soft auto-derive" above; full auto-flip is intentionally deferred
