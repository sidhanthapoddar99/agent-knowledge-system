---
title: "Future stages — index"
---

What comes after phase 1. **Phase 1 is rendering only**: the Rust engine renders every page correctly, checked against today's output. **Phase 2** adds the new editing mode, the dev toolkit and libraries. **Phase 3** is publishing: `agentks build` generates a static site (SSG) from the shared layout components, served by nginx or a CDN. **The launch** moves the project to Neuralabs and puts the homepage and docs online at agentks.neuralabs.org, with `agentks docs` opening them. **Later stages** hold multi-user editing with auth, the agent hooks and retrieval idea, a GitHub issues layout, and extensions.

# 03 References

- [Initial discussion](../01_initial-discussion/01_index.md)
- [Phasing](../01_initial-discussion/15_phasing.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): phase 1 is rendering and correct results. Editing mode, the toolbar, cache clearing and the other dev tools are phase 2.
- Decided (sidhantha, 2026-09-29): Phase 3 is publishing as a static export, with no Rust server. Publishers stay on 0.x until it ships.
- Decided (sidhantha, 2026-09-29): multi-user editing and agent hooks with retrieval are later stages.
- Decided (sidhantha, 2026-09-29): a GitHub issues layout, with machine-level GitHub sign-in, is a later stage.
- Decided (sidhantha, 2026-09-30): `agentks docs` opens the hosted docs at agentks.neuralabs.org/docs; only the latest docs are published. It ships when the site is live.
- Decided (sidhantha, 2026-09-29): libraries are shared engine machinery, not video-only. Claude placed them in Phase 2.
- Decided (sidhantha, 2026-09-30): a project declares its libraries in `config/dep.yaml` (git repositories or local folders) and agentks pins them in `config/dep.lock`. Each library's manifest describes it.
- Decided (sidhantha, 2026-09-30): the launch order — the Rust engine, the client and the default library tested end to end, the Neuralabs plugin marketplace, the homepage, the docs rewrite, hosting, archival.
- Decided (sidhantha, 2026-09-30): three repositories: `neuralabshq/agent-knowledge-system` (engine, client, homepage, docs, AI plugins), `neuralabshq/agent-knowledge-system-library` (the default library, templates, `library.json`) and `neuralabshq/plugin-marketplace`. Only the compressed installer is released.
- Decided (sidhantha, 2026-09-30): agentks runs in three states: developing agentks, using it, and publishing with `agentks build`, optionally inside a Dockerfile the user owns.
- Decided (sidhantha, 2026-09-30): publishing is SSG, not SSR: a shared UI package used by the local client and by a static renderer that builds every page once. Pages ship JavaScript only for interactive parts.
- Decided (sidhantha, 2026-09-30): each library has one `manifest.json` and one version series, and states the engine versions it is built for. Library owners migrate their libraries; users migrate their docs.
- Decided (sidhantha, 2026-09-30): the first Rust release is 1.0.0.
- Decided (sidhantha, 2026-09-30): extensions (`agentksx` commands and site scripts) are a possible later stage.

# 05 Notes & Analysis

## 01 The notes

| Stage | Note | What it covers |
|---|---|---|
| Phase 2 | [02/02 Editing mode](./02_editing-mode.md) | The old editor discarded; editing in the reading view, Obsidian-style |
| Phase 2 | [02/03 Dev toolkit](./03_dev-toolkit.md) | The dev tools rebuilt, and the switch for editing mode |
| Phase 2 | [02/09 Libraries, dep.yaml and dep.lock](./09_libraries-and-dependencies.md) | Libraries from GitHub or local folders, pinned by commit, cached per machine, described by their own manifests |
| Phase 3 | [02/07 Publishing with agentks build](./07_phase-3-publishing.md) | `agentks build` writes a static site for nginx, any static host or a CDN; a basic Dockerfile for users; publishers stay on 0.x until then |
| Launch | [02/10 Launch: order, hosting, retiring this repository](./10_launch-order-and-hosting.md) | Neuralabs, the six-step order, the homepage and `/docs`, the switch-over, the archival |
| Launch | [02/12 The repositories and three states](./12_repositories-and-three-states.md) | The three repositories, the main one's layout, development / usage / publishing, the tracker move |
| Launch | [02/08 The agentks docs command](./08_agentks-docs-command.md) | Opens the hosted docs at agentks.neuralabs.org/docs |
| Later | [02/04 Multi-user editing and auth](./04_multi-user-editing-and-auth.md) | Shared editing on `yrs`, auth first |
| Later | [02/05 Agent hooks and fast retrieval](./05_agent-hooks-and-retrieval.md) | Claude Code and Codex hooks, a search index for agents |
| Later | [02/06 GitHub issues layout](./06_github-issues-layout.md) | A layout showing a linked GitHub repository's issues, with a machine-level GitHub sign-in |
| Later | [02/11 Extensions](./11_extensions.md) | `agentksx` commands and site scripts from libraries |
