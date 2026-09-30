---
title: "Extensions: agentksx commands and site scripts (later stage)"
status: open
---

An **extension** would add functionality to agentks itself: commands that run as `agentksx <extension> <command>`, and JavaScript or TypeScript added to the site that runs at build time, in the browser, or beside the local engine. It is a later stage, not part of 1.0.0. This leaf carries forward what survives of the old [2025-06-25-plugin-system](../../../2025-06-25-plugin-system/issue.md) issue (whose build and render hooks contradict "rules stay in Rust") and turns the extensions note into a buildable design when the time comes. Until then its job is to keep 1.0.0 from blocking it.

# 01 To Do
- [ ] **Before 1.0.0 (guard only).** Check that nothing in the 1.0.0 design closes the door:
    - [ ] The `dep.yaml` parser rejects unknown keys today; reserve `extension: true` so adding it later is not a format break (coordinate with [120/10](../120_libraries/10_dep-yaml-and-lock.md)).
    - [ ] The page-data interface ([030/80](../030_rust-engine/80_page-data-interface.md)) is the one read path an extension would use; keep it documented and stable.
- [ ] **When the stage starts:**
    - [ ] Settle the open points: whether an extension is a library with a flag or a separate dependency; the `agentksx` command contract (arguments, project path, `--json`, exit codes); whether site scripts need a sandbox or a permission list; how the local sidecar starts and stops with `agentks start`.
    - [ ] Build the declaration (`extension: true` in `dep.yaml`), the manifest fields for commands and scripts, and the `agentksx` dispatcher.
    - [ ] Build-time scripts in the `agentks build` runtime; browser scripts as islands; the sidecar.
    - [ ] Show which extensions added scripts, locally and in `agentks build` output.
- [ ] **Carry over from the plugin-system issue** (its subtask [01_plugin-architecture](../../../2025-06-25-plugin-system/subtasks/01_plugin-architecture.md)): the sample extensions that still make sense as read-only site scripts — analytics (Plausible, Google Analytics) and comments (Giscus). RSS is now built in ([150/60](../150_publishing/60_seo-sitemap-feeds.md)); search is built in ([150/40](../150_publishing/40_static-search.md)). The hooks `onBuild`, `onContent`, `onRender`, `onConfig` are **not** carried: they change what the engine derives.
- [ ] **Carry over from its subtask** [03_ai-features](../../../2025-06-25-plugin-system/subtasks/03_ai-features.md): AI search and related-page suggestions belong to [130/50 agent hooks and retrieval](./50_agent-hooks-and-retrieval.md), not here. Summaries are an extension candidate.

## Guardrails
- An extension never changes what the engine derives (URLs, links, order, status, sidebars, validation) and never writes content.
- It runs only if the project lists it in `dep.yaml` and marks it.
- The base static build is unchanged; removing an extension gives exactly the site without it.
- Not called a plugin; plugin means an AI-agent plugin.

## Done when
- Before 1.0.0: `extension` is a reserved key in `dep.yaml` and the guard items are ticked.
- At the stage: a sample analytics extension adds a script to a built site, is listed in the build output, and removing it restores the base build byte for byte.

# 02 Status and Result
Open. Not started. Later stage; only the guard items belong before 1.0.0.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`.

**Read first**
- [Extensions](../../notes/04_ecosystem/03_extensions.md) — the boundaries.
- [Later stage: extensions](../../brainstorm/02_future-stages/11_extensions.md) — the discussion.
- The absorbed issue: [2025-06-25-plugin-system](../../../2025-06-25-plugin-system/issue.md), its subtasks [01](../../../2025-06-25-plugin-system/subtasks/01_plugin-architecture.md) and [03](../../../2025-06-25-plugin-system/subtasks/03_ai-features.md), and its [migration comment](../../../2025-06-25-plugin-system/comments/001_2026-09-29_engine-migration-impact.md). Subtasks 02 and 04 are already superseded by the search and knowledge-graph issues.

**Depends on:** 1.0.0 shipped; [150/00 publishing](../150_publishing/00_overview.md).
**Unblocks:** nothing in 1.0.0.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): extensions are a possible later stage, running `agentksx` commands and adding site scripts while the base build stays the same ([extensions](../../notes/04_ecosystem/03_extensions.md)).
- Decided (sidhantha, 2026-09-29): rules stay in Rust.
- Decided (claude, 2026-09-30): an extension may add commands and browser behaviour but never changes what the engine derives; it runs only when listed and marked in `dep.yaml`; it only reads (same note).

# 05 Notes & Analysis
## 01 What this leaf absorbed
- From [2025-06-25-plugin-system](../../../2025-06-25-plugin-system/issue.md): subtask 01 (plugin architecture) as re-scoped above, and subtask 03 (AI features) split between here and leaf 50. Once this leaf is accepted, the old issue can be marked superseded with a `→` line here and to leaf 50.

## Open until the work starts
- The four open points above, tracked in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (extensions row).
