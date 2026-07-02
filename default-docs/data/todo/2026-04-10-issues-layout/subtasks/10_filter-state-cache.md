---
title: "Cache filter state in localStorage, restore on bare URL"
status: done
---

URL is currently the source of truth for filters / search / sort / state-tab. Refresh works. The gap is **navigate to a detail page → come back → URL is bare → filters lost**.

## Behaviour

- Persist the full filter state to `localStorage` under a per-page key (e.g. `issues-state:<base_url>`)
- On page load: **restore from cache only if the URL has no query params** ("restore unless query is present")
- Any explicit URL (shared link, bookmark) wins over the cache
- Update cache on every filter / search / sort / tab change

## Edge cases

- Clearing all filters writes the cleared state to cache
- Cache key is per-tracker (one cache per `base_url` so multiple issue trackers don't collide)
- Schema bump: include a version field in the cached blob so future filter additions don't crash on old caches
