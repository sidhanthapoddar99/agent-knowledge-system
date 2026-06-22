---
title: "Grouped view: unified + persistent status filter"
state: closed
---

- [x] **Sync the status filter across all groups.** When grouping is active, every group section should reflect a single shared status value rather than each group carrying its own independent status tab. Toggling the status anywhere — global strip or any group's strip — updates that one value and re-renders all groups. The per-group tab UI can stay for ergonomic reasons (close to where the user is looking), but it becomes a synced view of one state, not N independent filters.
- [x] **Verify the synced status survives a refresh.** This should fall out of step 1 automatically (the unified value is `state.state`, which is already persisted to `localStorage` via `FILTER_CACHE_KEY`), but it must be tested explicitly: set a non-default status while grouped, refresh, confirm the status and the grouping both come back.

Docs and plugin-skill updates were dropped on review: this is a UI-behaviour fix (how the existing filter widget behaves under grouping), not a new user-facing concept. The user-guide and skill reference don't need to change.

## Landed in

- `astro-doc-code/src/layouts/issues/default/scripts/index/types.ts` — drop `tab` from `GroupSubState`, leaving only `page`.
- `astro-doc-code/src/layouts/issues/default/scripts/index/groups.ts` — `buildGroupSection()` now reads `state.state` instead of `sub.tab`; cloned tab strips reflect the same global value.
- `astro-doc-code/src/layouts/issues/default/scripts/index/client.ts` — single click handler for state tabs (global strip and group clones share one path); also resets every group's page cursor when status changes.

Tested in browser at `/todo`: flat-view status persists across refresh, grouped-view status syncs across all sections, status survives switching grouping dimension, and survives grouped → flat → grouped transitions.

## The problem

In the **flat (non-grouped) view**, the status filter behaves correctly: pick "open", refresh, you're still on "open". The single `state.state` field is part of the persisted filter cache.

In the **grouped view**, the same status filter behaves badly:

1. **It resets on refresh.** Pick "open" inside a group, refresh, every group is back to "all".
2. **It's incoherent across groups.** Each group has its own status switch independent of the others, with no obvious mental model for why group A would be filtered to "open" while group B is on "all".

Both symptoms come from the same architectural choice and disappear if we unify on a single status value.

## Root cause

`buildGroupSection()` in `astro-doc-code/src/layouts/issues/default/scripts/index/groups.ts` clones the global state-tab strip for each group and tracks each group's selection in a `groupSubs` in-memory `Map` (`sub.tab`). Two consequences:

- `groupSubs` is **not persisted** — it lives in module-scope memory, never written to `localStorage`. The serializer in `client.ts` (`FILTER_CACHE_KEY`) only writes `state.state` and the other `FilterState` fields. A refresh wipes `groupSubs` to empty, so every group falls back to its default tab.
- `groupSubs` is **per-group** by construction — the map is keyed by group value, so each group section is a fully independent mini-board. There is no shared status across groups even within a single session.

`resetGroupStateIfNeeded(groupField)` already wipes the map on group-dimension change, which is the right behaviour for *page* state but is the wrong shape for *status* state — status is conceptually a global filter, not a per-group view setting.

## The fix (shape, not implementation)

Stop using `sub.tab` for status. Have `buildGroupSection()` read `state.state` and route any clicks on cloned status tabs back through the same handler that updates the global `state.state` (the one that already persists). Keep `groupSubs` for things that genuinely *are* per-group (current page number within a group's pagination), drop the `tab` field from it.

After the change:
- One source of truth (`state.state`) for status across the whole index, grouped or not.
- The cloned tab strips inside each group section reflect that one value and stay in sync automatically on re-render.
- Persistence is inherited from the existing flat-view code path — no new cache key, no new serializer field.

## Files likely touched

- `astro-doc-code/src/layouts/issues/default/scripts/index/groups.ts` — drop `tab` from `groupSubs`; have `buildGroupSection()` consume `state.state`; route per-group tab clicks to the same dispatcher the global tabs use.
- `astro-doc-code/src/layouts/issues/default/scripts/index/client.ts` — confirm the global tab handler is reused (no parallel dispatch path); no schema change to the persisted cache.
