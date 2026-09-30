---
title: "Search"
status: superseded
---

→ superseded by [2026-04-19-site-wide-search](../../2026-04-19-site-wide-search/issue.md), which owns site search, and by the agent retrieval stage of [2026-09-29-rust-core-engine-migration](../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/05_agent-hooks-and-retrieval.md).

## Goal

Global client-side search returns relevant results in under 100ms, with fuzzy matching and dictionary-based typo corrections. RAG / AI-based search is covered separately in [03_ai-features.md](./03_ai-features.md).

## Tasks

- [ ] Global client-side search with Pagefind or Fuse.js
- [ ] Fuzzy matching
- [ ] Dictionary-based typo / spelling corrections ("did you mean…?")
- [ ] Search UI component (modal, inline)
- [ ] Search result highlighting
- [ ] Keyboard shortcut (Cmd/Ctrl + K)
- [ ] Search analytics (popular queries, zero-result queries)
