---
title: "Idea: agent hooks and fast retrieval"
---

**An idea to pursue later, not a decision.** Two things become cheap once the engine is a fast Rust binary with a build cache. First, **hooks for Claude Code and Codex** that check and guide an agent while it edits docs, scans the tracker and writes agent logs. Second, a **retrieval index** so an agent finds what it needs in one query instead of searching in depth.

# 03 References

- [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md) — full-text search, planned with Orama (a JavaScript search library). A Rust index would serve both the site and agents, so the two should be designed together.
- [2026-04-19-knowledge-graph-and-wiki-links](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md) — the link-graph indexer (backlinks, orphans, broken links). The same index can hold it.
- [The ~/.agentks build cache](../01_initial_discussion/07_agentks-home-and-build-cache.md) — where the index would live.

# 04 Decisions

None. Recorded on 2026-09-29 as an idea (sidhantha) to revisit after the migration phases are agreed.

# 05 Notes & Analysis

## 01 Why this fits the migration

- A hook runs on every tool call, so it must be fast. A Rust binary answers in milliseconds, with no Node or Bun start-up.
- The build cache already holds parsed pages: titles, headings, frontmatter, links. An index is a small step from there.
- The plugin ships no hooks today. The skills tell agents what to do but nothing checks it as it happens.

## 02 Hook ideas (claude)

| When | What the hook does |
|---|---|
| Session start | Inject the project overview (bare `agentks`) and, if the session names an issue, its bounded context |
| A prompt mentions an issue id | Inject `issue context` for it, so the agent skips the pick-up reads |
| After an edit to a content file | Run the file checks (frontmatter, link form, prefixes) on that file only, and feed errors straight back so the agent fixes them in the same turn |
| Before a shell `mv` inside content | Block it and point to `agentks move`, which keeps links intact |
| Before a text search over the tracker | Suggest `agentks issue list` or `agentks find`, which read the schema |
| When a run stops | If an agent log is in progress, remind the agent to write the handover; check the log's index against its files |

Claude Code supports hooks at these points today. Codex's hook support needs checking before we design for both. The hook logic should live in the binary, with the plugin holding thin hook definitions, so both agents share one implementation.

## 03 Retrieval ideas (claude)

- **Full-text index** built from the cache, for example with tantivy (a Rust search library). Kept current by the file watcher.
- **Link graph** in the same index: what links here, orphans, broken links.
- **Optional semantic search** with a small local embedding model (a model that turns text into vectors so similar meanings match). An optional download, like the narration voice model.
- **One query command**, something like `agentks ask "<question>"`, returning ranked sections with paths and a size limit, so an agent reads a few paragraphs instead of whole files.
- Possibly an **MCP server** (the standard way agents call external tools) exposing search and issue context, so any agent can use it without shelling out.

## 04 Open points for later

- Which hooks are worth their noise. A hook that fires too often trains agents to ignore it.
- Whether semantic search earns its model download, or full-text plus the link graph is enough.
- How this merges with the site-wide search issue, so the site and agents use one index.
