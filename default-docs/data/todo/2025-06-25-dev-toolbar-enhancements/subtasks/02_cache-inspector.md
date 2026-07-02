---
title: "Server cache inspector"
status: open
---

View of what is currently in the server's in-memory caches. Names, sizes, and
per-entry keys are visible at a glance; full payloads stay abstracted so the
panel can stay compact.

## Caches to surface

- **Yjs rooms** (`YjsSync.rooms`) — one entry per open file. Show: file path,
  active connection count, Y.Doc update size (bytes), last-activity age.
- **Editor docs** (`EditorStore.documents`) — one entry per open doc. Show:
  file path, raw markdown byte size, dirty flag.
- **Presence** (`PresenceManager.users`) — user count + one line per active
  user (name, current page, latency).
- **Issues cache** (`src/loaders/issues.ts`) — one entry per tracker data
  path. Show: issue count, cache signature, approximate heap size.
- **Content cache** (`src/loaders/data.ts` / `cache-manager.ts`) — per-path
  entries with file count + last-invalidated timestamp.

## Display

- Flat table per cache: `Key` · `Size` · `Meta` columns.
- Sizes in KB; entries past 100 KB highlighted.
- Click a row to expand its metadata. Body content stays abstracted (no full
  markdown dumps).

## Out of scope

- Mutating caches from the panel (no "evict" button in this pass).
- Historical / time-series view.
