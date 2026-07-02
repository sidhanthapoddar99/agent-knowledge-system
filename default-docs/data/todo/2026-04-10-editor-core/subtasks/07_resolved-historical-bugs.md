---
title: "Resolved historical bugs"
status: done
---

Fixed bugs from the Editor V2 development loop — kept here for the audit trail.

- [x] Content duplication on long docs without scrolling
- [x] Zombie WebSocket reconnection after cleanup
- [x] Yjs sync fires too early (before content arrives)
- [x] CM6 doc length 0 despite ytext having content
- [x] Catch-all route crash on `/editor`
- [x] Preview not formatted (missing content CSS)
- [x] Sidebar collapse not working (inline style override)
- [x] Dark mode table alternate row coloring
- [x] Code blocks all green (missing `codeLanguages`)
- [x] Theme toggle destroyed editor + Yjs room (caused content duplication in multi-user)
- [x] Room destroyed on close even with other users connected
