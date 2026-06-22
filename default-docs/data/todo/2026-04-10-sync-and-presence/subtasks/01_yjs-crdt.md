---
title: "Yjs CRDT via WebSocket"
state: closed
---

## Tasks

- [x] Content-duplication bug fix (disposed flag)
- [x] Consume-on-read counter (replaced `setTimeout`)
- [x] Textarea readonly until sync completes
- [x] Room idle eviction (30 min, 0 connections)
- [x] Stats endpoint (`/__editor/stats`)
- [x] Theme toggle hot-swap (no editor destroy — prevents content duplication)
- [x] Room connection-aware close (only destroy when no other users connected)
