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

Implemented in `2026-05-07-sidebar-state-persistence`; storage format
restructured to per-scope blobs in `2026-06-10-sidebar-cache-v2` (issue tracker).

## Where the state lives

`localStorage`, as **one blob per page scope** — for docs, the scope is the
docs *section* (the sidebar is shared by every page in a section); for issues,
the individual *issue*. Each blob stores **only deviations from the
server-rendered default** (delete-on-default): a user who only browses never
creates keys, and toggling a folder back to its default deletes its entry. An
empty blob removes its key entirely.

Why this granularity (and not one key per folder, or one global blob):

- **Restore is one read.** Loading a page reads exactly one key — its own
  scope's blob — instead of scanning every stored key.
- **No global-blob downsides.** A toggle rewrites one small per-page blob, not
  the whole store; cross-tab clobbering would require two tabs on the *same*
  issue. All folders on a page restore together anyway, so the blob is the
  natural read unit.
- **Small blast radius.** One corrupt blob loses one page's state.

## Key shape

| Layout | Pattern | Example |
|---|---|---|
| Docs sidebar | `sidebar-collapse:<section-root>` | `sidebar-collapse:dev-docs` |
| Issues detail sidebar | `issues-sidebar-collapse:<tracker>:<issue-id>` | `issues-sidebar-collapse:todo:2026-05-07-sidebar-state-persistence` |

`<section-root>` is the first URL segment (e.g. `dev-docs`, `user-guide`), so
two docs sections never share a blob.

## Value shape

```json
{ "ts": 1781015654446, "f": { "05_architecture/05_layout-internals": 1 } }
```

- `ts` — epoch millis of the last write; one TTL per scope.
- `f` — folder-path → collapsed flag (`0 | 1`), **deviations only**. The
  folder paths are the server-emitted `data-collapse-key` attributes (docs:
  `SidebarSection.slugPath`; issues: the sub-doc folder path like `notes`,
  `subtasks`, or a nested `notes/<group>`) — stable slugs, never display labels.

The server-rendered default a deviation is measured against is captured at
script start from the initial DOM (`data-collapsed` attributes for docs,
`details.open` for issues), *before* any restore mutates it. Note the issues
default for a group can depend on the visited page (the active sub-doc's group
renders open), so "deviation" is relative to the current page's default.

## TTL and garbage collection

Blobs expire **30 days** after their last write. Pruning is **lazy** — on page
load, the restore script scans the feature's prefix and removes anything
expired or malformed. With per-scope blobs the scan checks **one `ts` per
visited page**, not one per folder. The same scan drops legacy v1 keys (the
old one-key-per-folder format — any payload without an `.f` object), so the
format self-migrates with no version flag.

## Restore path (and why it doesn't flash)

Both sidebars restore state from a **blocking `is:inline` script** placed with
the sidebar markup (the same pattern `BaseLayout` uses for dark mode). The
script runs before first paint: GC scan → one `getItem` for the page's scope →
apply the stored deviations over the server-rendered defaults — so the
restored state is what paints first; there is no flash of the default state.

Mechanics per layout:

- **Docs** — collapse state is a `data-collapsed` attribute on elements
  carrying `data-collapse-key`; click handlers write deviations through to the
  blob (or delete them, on toggle-back-to-default).
- **Issues** — the top-level groups and nested sub-doc groups are native
  `<details>` elements; the script restores the `open` attribute and listens
  for `toggle` events to write back. A `suppress` guard swallows the toggle
  events fired by the programmatic restore/sync changes — `<details>` toggle
  events are queued tasks, so they reach listeners even when bound "after" the
  mutation.

## Sync-wins rule

The sidebar also syncs to the currently opened page: ancestors of the active
entry are **force-expanded** and the active item is scrolled into view
(`block: 'nearest'`). This is a render-time concern that **wins over the
cache but never writes to it** — landing on a page inside a folder you
previously collapsed will open that folder for the visit, but your cached
preference survives untouched and still applies elsewhere.

## Inspecting and clearing — Browser Cache toolbar app

In dev, the **Browser Cache** app (3-dot overflow of the Astro dev toolbar,
below Cache Inspector) lists the framework's localStorage keys grouped by
prefix — docs sidebar collapse, issues sidebar collapse, issues list filters,
editor UI prefs — with per-group **Clear** and **Clear all framework keys**.
Cache Inspector covers the *server-side* in-memory caches; Browser Cache
covers the browser side. Source: `src/dev-tools/browser-cache/`.

## Cross-project namespacing

Local dev and preview reuse the same `localhost:<port>` origin, so **two
different documentation projects currently share these keys** (the scope
segments disambiguate *content*, not *projects*). Site-identity namespacing —
wrapping all browser-side cache keys under a per-project identity prefix, with
archive-on-mismatch — is planned under the
`2026-05-07-cache-isolation-cross-project` issue; when it lands, the wrapper
layer will be documented here.
