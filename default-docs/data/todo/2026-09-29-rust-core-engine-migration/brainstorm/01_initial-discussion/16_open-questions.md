---
title: "Open questions"
---

The questions to settle before a plan is written. Each one gets a decision line here when it is answered, and the answer moves into the note it belongs to. Still open: **04** (which dev tools, Phase 2), **07** (the index's data structure), **08** (the structure model) and **12** (the UI framework).

# 03 References

- [Index](./01_index.md)
- [The architecture: a local SPA over WebSocket](./17_local-spa-over-websocket.md) — settled questions 01 and 10.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): question 01 — no server-side templates. The Vite frontend, a single-page app, renders every layout from JSON that Rust sends.
- Decided (sidhantha, 2026-09-29): question 02 — the frontend ships embedded in the binary.
- Decided (sidhantha, 2026-09-29): question 03 — small visual changes are acceptable if they are improvements and minimal. Nothing drastic.
- Decided (sidhantha, 2026-09-29): question 05 — everything the user sees is renamed to agentks, everywhere, so there is no ambiguity.
- Decided (claude, delegated by sidhantha, 2026-09-29): question 06 — the new engine is proven by route parity, a comparison of each page's rendered content between the old and new engines in a headless browser, and screenshots of each layout. The user's own use is the final check.
- Decided (sidhantha, 2026-09-29): question 07 — the hybrid: build an index of the whole site at start-up, render pages on request, cache them where it pays.
- Decided (sidhantha, 2026-09-29): question 09 — the Go issue is set to `superseded`, pointing at this issue, with a comment in each. Its folder stays where it is.
- Decided (sidhantha, 2026-09-29): question 10 — rules stay in Rust. Rust sends derived data; no TypeScript is generated and no WASM is built.
- Decided (sidhantha, 2026-09-30): question 11 — narration audio belongs to the video issue, [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md). The voice model is a separate download, not a library.
- Decided (sidhantha, 2026-09-30): question 13 — `[[path]]` keeps today's meaning: embed the file, with the path relative to the page. Links stay ordinary markdown links, `[text](path)`, relative to the page. There are no wiki links by name and no `[[[...]]]` syntax. Library elements are never named in markdown, only in video and artifact pages. The Rust engine translates every relative path. No migration is needed.

# 05 Notes & Analysis

## 01 How are layouts written?

**Decided:** as components of the Vite single-page app, fed by JSON over the WebSocket. Since 2026-09-30 they live in a shared package that the Phase 3 static build also renders ([Phase 3](../02_future-stages/07_phase-3-publishing.md)). Server-side templates (minijinja, askama) were considered first, because a static HTML site was then treated as a Phase 1 requirement. Once agentks was framed as a local tool, with publishing as the Phase 3 export, templates had no job left. See [the architecture note](./17_local-spa-over-websocket.md).

## 02 How does the frontend ship?

Embedded in the binary (one file, works offline, likely 10+ MB larger) or downloaded per version on first run. **Decided:** embedded.

## 03 How close must markdown and highlighting match?

The Rust markdown parser (comrak) and a Rust highlighter will not produce exactly what `marked` and Shiki produce today. **Decided:** small visual changes are fine if they are improvements and minimal. Routes, heading IDs, links and text must match exactly (claude's reading of "nothing drastic").

## 04 Which dev tools survive?

The dev toolkit is Phase 2 (decided). Still open: which of today's apps are rebuilt — the layout picker, error log, cache inspector, browser cache and system metrics. See [dev toolkit](../02_future-stages/03_dev-toolkit.md).

## 05 How far does the rename reach?

**Decided:** everything the user sees becomes agentks, in one release.

## 06 How is the new engine proven correct?

**Decided (delegated to claude):**

- **Route parity:** every route the Astro engine serves, the new engine serves ([the route-parity check](../../../../../../scripts/checks/check-route-parity.mjs) already exists).
- **Rendered content:** a headless browser loads each page from both engines and compares the rendered main content after normalising whitespace and attribute order — headings and their IDs, links and their targets, text, tables, code. With the frontend now a single-page app, comparing raw server HTML no longer works; the rendered page is what counts. The prior audit's [JIT rendering study](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/021_question_jit-rendering.md) proposed the same golden-diff idea.
- **Screenshots** of each layout in light and dark mode, reviewed by eye for "nothing drastic".
- **Coverage** includes first-class diagram and artifact pages with their sidecars, and the tracker fixture [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) for the issues layout.
- **The user's own use** as the final check.

## 07 Render on the fly, or build and cache?

**Decided:** the hybrid. At start-up Rust builds an index of the whole site. Page data is rendered when the frontend asks for it and cached by content hash, in Rust and in the browser.

**Still open — the index's data structure.** The user raised Merkle and Patricia trees. Claude's proposal:

- **Take the Merkle part.** Each file gets a content hash; each folder's hash is rolled up from its children. A change re-hashes only its parent chain. That answers "did anything under this folder change?" instantly (when to rebuild a sidebar or the issue list), gives cache keys, and gives the frontend the versions it caches by.
- **Skip the Patricia part.** A radix tree speeds up path-prefix lookups, but the prior audit measured a median of 3 entries per folder and found a plain ordered map faster than a B-tree for prefix scans. At about 1,300 pages, an ordered map keyed by path is enough.
- **Skip Merkle Patricia** (Ethereum's variant, for proving membership to outsiders) and **z-order indexes** (for spatial data).

## 08 Does the Rust design adopt the structure / layout / theme / shell model?

[The model](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md) from the prior issue was proposed as the backbone for a rewrite. Adopt it, change it, or drop it? Its external-layout option is now contradicted by the no-custom-layouts decision. In the new split, "structure" (URLs and parsing rules) would live in Rust and "layout" and "shell" in the frontend. The old issue's open subtask `01_define-and-discuss-structure` formalises this model and could move here, re-scoped to built-in layouts only.

## 09 What happens to the prior Go issue?

**Decided:** set to `superseded` on 2026-09-29, folder kept in place (24 files elsewhere link into it). [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md) was repointed to this issue on 2026-09-29. Still open: moving the Go issue's subtask `01_define-and-discuss-structure` here (see question 08).

## 10 How do shared rules reach the TypeScript frontend?

**Decided:** they don't need to. Rules stay in Rust, and the frontend receives their results as data — each issue with its status category, each page with its order and URL. Today's copies in browser scripts (for example the issues layout's [the detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts) and [the index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts)) disappear. See [the architecture note](./17_local-spa-over-websocket.md).

## 11 Where does narration audio go?

**Decided:** the video issue owns narration audio ([video](./14_video-and-narration-audio.md)). The voice model is a separate download into `~/.agentks/models/`, not a library.

## 12 Which UI framework does the frontend use?

New with the single-page app. Candidates include React, Preact, Solid, Svelte and Vue. The engine already bundles React for Excalidraw, which counts slightly in React's favour. Criteria: first-load size, lazy loading of layouts, a router that handles real paths and `#heading` anchors, and how well AI agents write it. **Hard requirement since 2026-09-30:** it must render the shared components to HTML at build time and support islands, so a published page ships JavaScript only for its interactive parts and is never hydrated as a whole ([Phase 3](../02_future-stages/07_phase-3-publishing.md)). Preact, Solid and Svelte do this well; React can, with more work.

## 13 What does `[[...]]` mean?

Today's engine uses `[[path]]` to embed a file's contents. [2026-04-19-knowledge-graph-and-wiki-links](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md) defines `[[target]]` as a wiki link and `[[[target]]]` as an embed. The Rust parser can support only one meaning. Changing today's meaning needs a migration.

**Decided: keep today's meaning, and keep markdown plain.** A page uses two reference forms, both relative to the file:

| Form | Meaning |
|---|---|
| `[text](./path.md)` | A link. Standard markdown, readable by every app |
| `[[./path]]` | An embed: show the file's content here. The one non-standard form, kept because diagrams and code files need it |

Nothing else. No wiki links by name, no `[[[...]]]`, and no library names such as `icons:server` in markdown. The reason is portability: a folder of agentks markdown must open cleanly in Obsidian or any other note app, and move in and out of agentks without a converter. Library elements belong to video pages and artifact pages ([libraries](../02_future-stages/09_libraries-and-dependencies.md)). The knowledge graph can still draw backlinks from ordinary links.
