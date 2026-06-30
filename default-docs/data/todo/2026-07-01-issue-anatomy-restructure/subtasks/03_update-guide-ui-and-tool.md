---
title: Update the documentation guide, UI, and tooling
state: open
---

Implement the structure in the framework once it's decided (subtask 01).

- [~] Loader (`src/loaders/issues.ts`) — add `brainstorm` and `agent-memory` to the
      sub-folder list (currently `comments`, `subtasks`, `notes`, `agent-log`); add
      readers; comments stay flat (no change there). **Brainstorm done** (`readFreeformDocs`);
      agent-memory pending.
- [~] Routing + sidebar — new sections in `DetailSidebar` / `route-match` /
      `static-paths` / helpers. **Brainstorm done**; agent-memory pending.
- [ ] Agent-log `kind` badge from per-folder `settings.json`
- [ ] The rendered **guide** surfaced on every issue (host per subtask 01 decision)
- [ ] Validators (`docs-check-section`) updated for the new sections
