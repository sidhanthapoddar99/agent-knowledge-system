---
title: "Future stages — index"
---

What comes after phase 1. **Phase 1 is rendering only**: the Rust engine renders every page correctly, checked against today's output. **Phase 2** adds the new editing mode and the dev toolkit. **Phase 3** is publishing, a static export served by nginx. **Later stages** hold multi-user editing with auth, the agent hooks and retrieval idea, and a GitHub issues layout.

# 03 References

- [Initial discussion](../01_initial_discussion/01_index.md)
- [Phasing](../01_initial_discussion/15_phasing.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): phase 1 is rendering and correct results. Editing mode, the toolbar, cache clearing and the other dev tools are phase 2.
- Decided (sidhantha, 2026-09-29): Phase 3 is publishing as a static export, with no Rust server. Publishers stay on 0.x until it ships.
- Decided (sidhantha, 2026-09-29): multi-user editing and agent hooks with retrieval are later stages.
- Decided (sidhantha, 2026-09-29): a GitHub issues layout, with machine-level GitHub sign-in, is a later stage.

# 05 Notes & Analysis

## 01 The notes

| Stage | Note | What it covers |
|---|---|---|
| Phase 2 | [02/02 Editing mode](./02_editing-mode.md) | The old editor discarded; editing in the reading view, Obsidian-style |
| Phase 2 | [02/03 Dev toolkit](./03_dev-toolkit.md) | The dev tools rebuilt, and the switch for editing mode |
| Phase 3 | [02/07 Publishing as a static export](./07_phase-3-publishing.md) | SSG for nginx, search-engine friendly, no Rust server; publishers stay on 0.x until then |
| Later | [02/04 Multi-user editing and auth](./04_multi-user-editing-and-auth.md) | Shared editing on `yrs`, auth first |
| Later | [02/05 Agent hooks and fast retrieval](./05_agent-hooks-and-retrieval.md) | Claude Code and Codex hooks, a search index for agents |
| Later | [02/06 GitHub issues layout](./06_github-issues-layout.md) | A layout showing a linked GitHub repository's issues, with a machine-level GitHub sign-in |
