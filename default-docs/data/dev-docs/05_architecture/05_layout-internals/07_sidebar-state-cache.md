---
title: Sidebar State Cache
description: How the docs and issues sidebars persist collapse state in localStorage
sidebar_position: 7
---

# Sidebar state cache

Both the docs sidebar and the issues detail sidebar persist their collapse /
expand state across navigations and refreshes using `localStorage`. This page
documents where the state lives, the key and value shapes, TTL behaviour, and
how persistence interacts with the sync-to-opened-page logic.

Implemented in `2026-05-07-sidebar-state-persistence` (issue tracker).

## Where the state lives

`localStorage`, as **one flat key per collapsible folder**, namespaced by a
colon-separated prefix. `localStorage` has no hierarchy — the prefix *is* the
hierarchy, and it makes all of a feature's keys enumerable with a prefix scan
(both for the pruning pass and for filtering in devtools).

Flat per-folder keys were chosen over a single JSON blob deliberately:

- **Atomic writes** — a toggle writes one ~60-byte key; no read-modify-write of
  a shared blob, so two tabs can never clobber each other's unrelated toggles.
- **Per-entry TTL** — each value carries its own timestamp, so stale entries
  are deleted individually.
- **Small blast radius** — one corrupt key loses one folder's state, not all of it.

## Key shape

| Layout | Pattern | Example |
|---|---|---|
| Docs sidebar | `sidebar-collapse:<section-root>:<folder-path>` | `sidebar-collapse:dev-docs:05_architecture/05_layout-internals` |
| Issues detail sidebar | `issues-sidebar-collapse:<tracker>:<issue-id>:<folder-path>` | `issues-sidebar-collapse:todo:2026-05-07-sidebar-state-persistence:notes/derived-issues-updates` |

- `<section-root>` is the first URL segment (e.g. `dev-docs`, `user-guide`), so
  two docs sections never share keys.
- `<folder-path>` is the server-emitted `data-collapse-key` attribute — the
  stable slug path of the collapsible node (docs: `SidebarSection.slugPath`;
  issues: the sub-doc folder path like `notes`, `subtasks`, or a nested
  `notes/<group>`). Because the key comes from the server-rendered DOM, it is
  stable across renders and never derived from display labels.

## Value shape

```json
{ "c": 0, "ts": 1781015654446 }
```

- `c` — collapsed flag, `0 | 1` (not a bare boolean: the wrapper object exists
  so every entry carries its own timestamp, and the short name keeps entries tiny).
- `ts` — epoch millis of the last write, used for TTL.

## TTL and garbage collection

Entries expire **30 days** after their last write. There is no background
timer: pruning is **lazy** — on every page load, the restore script scans the
feature's prefix, `JSON.parse`s each entry, and `removeItem`s anything expired
or malformed. The cache is therefore self-cleaning at exactly the moment it is
read.

## Restore path (and why it doesn't flash)

Both sidebars restore state from a **blocking `is:inline` script** placed with
the sidebar markup (the same pattern `BaseLayout` uses for dark mode). The
script runs before first paint, reads the cached keys, and sets the
open/closed state directly on the server-rendered elements — so the restored
state is what paints first; there is no flash of the default state.

Mechanics per layout:

- **Docs** — collapse state is a `data-collapsed` attribute on elements
  carrying `data-collapse-key`; the script reads all `sidebar-collapse:` keys
  into a map once, applies them, then binds click handlers that write through
  to the cache.
- **Issues** — the four top-level groups (`this-issue`, `notes`, `subtasks`,
  `agent-log`) and nested sub-doc groups are native `<details>` elements; the
  script restores the `open` attribute and listens for `toggle` events to write back.

## Sync-wins rule

The sidebar also syncs to the currently opened page: ancestors of the active
entry are **force-expanded** and the active item is scrolled into view
(`block: 'nearest'`). This is a render-time concern that **wins over the
cache but never writes to it** — landing on a page inside a folder you
previously collapsed will open that folder for the visit, but your cached
preference survives untouched and still applies elsewhere.

## Cross-project namespacing

Local dev and preview reuse the same `localhost:<port>` origin, so **two
different documentation projects currently share these keys** (the
`<section-root>` / `<tracker>:<issue-id>` segments disambiguate *content*, not
*projects*). Site-identity namespacing — wrapping all browser-side cache keys
under a per-project identity prefix, with archive-on-mismatch — is planned
under the `2026-05-07-cache-isolation-cross-project` issue; when it lands, the
wrapper layer will be documented here.

## Known improvement: delete-on-default

The current write path stores state on **every** toggle, including toggles
back to the server-rendered default — so the cache accumulates entries like
`{"c":0}` that carry no information. The standard production pattern is
**delete-on-default**: when a toggle returns a folder to its default state,
`removeItem` instead of `setItem`, so storage holds only deviations. Not yet
implemented; tracked on the persistence issue.
