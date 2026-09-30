---
title: "Agent hooks and fast retrieval (later stage)"
status: open
---

Once agentks is a fast Rust binary with a build cache, two things become cheap. **Hooks** for Claude Code and Codex can check and guide an agent while it edits docs, scans the tracker and writes agent logs. A **retrieval index** can let an agent find the right few paragraphs instead of reading whole files, and the same index can serve the site's own search. This is a later stage, after 1.0.0. The logic lives in the binary; the plugins hold only thin hook definitions.

# 01 To Do
- [ ] **Before 1.0.0 (guard only).** Keep the door open:
    - [ ] The engine's search index ([030/95 retrieval index](../030_rust-engine/95_retrieval-index.md)) is built so an agent-facing query can reuse it.
    - [ ] Every check the CLI runs on a whole project can also run on one file, fast (a hook checks only the edited file).
- [ ] **Hooks (at the stage).**
    - [ ] Confirm Codex's hook support first, then design one binary-side command per hook point, e.g. `agentks hook post-edit --file <path> --json`.
    - [ ] Session start: inject the project overview and, if the session names an issue, its bounded context.
    - [ ] A prompt names an issue id: inject `issue context`.
    - [ ] After an edit to a content file: run the file checks on that file and return errors to the agent in the same turn.
    - [ ] Before a shell `mv` inside content: block and point to `agentks move`.
    - [ ] Before a text search over the tracker: suggest `agentks issue list` or `agentks find`.
    - [ ] When a run stops with an agent log in progress: remind the agent to write the handover; check the log's index.
    - [ ] Measure noise: count how often each hook fires in real sessions and drop any that fire too often to be read.
- [ ] **Retrieval (at the stage).**
    - [ ] A full-text index (tantivy is the candidate) and the link graph, from the build cache, kept current by the watcher.
    - [ ] One query command, for example `agentks ask "<question>" --json`, returning ranked sections with paths and a size limit.
    - [ ] Optionally an MCP server exposing search and issue context.
    - [ ] Optional semantic search with a small local embedding model, as an optional download like the voice model — only if full text plus the graph is not enough.
    - [ ] One index shared with site search; merge with the site-wide search issue's plans ([2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md), subtasks 05 AI search API and 06 regex).

## Guardrails
- Hook logic lives in the binary; plugins hold thin definitions only.
- No hook that fires on every tool call unless it is measured to help.
- Semantic search is optional and never required for the base tool.

## Done when
- Before 1.0.0: the guard items are ticked.
- At the stage: the post-edit hook returns a link-form error to Claude Code within 100 ms on this repository's docs, and `agentks ask` returns ranked sections for a question about the tracker.

# 02 Status and Result
Open. Not started. Later stage.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` (engine commands and `plugins/agentks/hooks`).

**Read first**
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), section 07.
- [Idea: agent hooks and fast retrieval](../../brainstorm/02_future-stages/05_agent-hooks-and-retrieval.md).
- [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md) and [2026-04-19-knowledge-graph-and-wiki-links](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md).
- AI features from the old plugin-system issue: [03_ai-features](../../../2025-06-25-plugin-system/subtasks/03_ai-features.md) (AI search, related pages).

**Depends on:** 1.0.0 shipped; [030/95 retrieval index](../030_rust-engine/95_retrieval-index.md).
**Unblocks:** nothing in 1.0.0.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): hooks for Claude Code and Codex, and fast retrieval for agents, are a later stage ([AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md)).

# 05 Notes & Analysis
## Watch out
- A hook that blocks `mv` must allow `mv` outside content folders; match on the project's content sections from `site.yaml`, not on path guesses.

## Open until the work starts
- Which hooks are worth their noise; Codex hook support; whether semantic search earns its download; how one index serves the site and agents. Tracked in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md).
