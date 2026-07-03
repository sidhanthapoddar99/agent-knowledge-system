---
title: "Tracker scan — issues still referencing custom tags (next-cycle worklist)"
---

# Tracker scan — issues still referencing custom tags

Read-only scan of `data/todo/` run 2026-07-03 during the native-markdown execution
run (`../agent-log/020_wf_native-markdown-execution/`). Purpose: the user asked
which *other* issues still treat custom tags as a feature, to be updated **in the
next cycle** — nothing below has been edited. 13 issues had hits: 7 need updates,
4 are historical/fine, 2 are false positives.

## NEEDS UPDATE (7 — all open/in-progress)

1. **`2026-04-19-knowledge-graph-and-wiki-links`** (open) — *highest priority.*
   `subtasks/01_unified-pipeline-and-graph.md` lists the custom-tags registry as a
   pipeline preprocessor and has a verify criterion "`<callout>/<tabs>/<collapsible>`
   tags render everywhere"; `subtasks/05_update-dev-docs.md` plans to "document
   that it's now actually wired"; `issue.md` motivation #3 cites the unwired
   registry as a driver. → Drop the registry from the pipeline plan, the verify
   criterion, and the motivation.
2. **`2026-04-19-docs-phase-2`** (open) — `comments/004_custom-tags-removed.md`
   carries the "restore the user-guide page once the registry is wired" plan (now
   void — the native-markdown reference from our subtask 30 replaces it);
   `issue.md` L67 scopes "Writing Content" as covering "custom tags";
   `notes/01_proposed-file-structure.md` still lists `04_custom-tags.md`.
3. **`2026-05-08-runtime-stack-migration`** (open) — the Go-rewrite architecture
   notes plan to reimplement "~10 built-in custom-tag handlers" (`callout.go`,
   tabs, collapsible) in goldmark, and the performance comparison budgets a
   "custom-tag transform" stage. → Add an issue-level decision note: the Go
   pipeline implements GFM alerts / `<details>` / fenced diagrams instead; dated
   exploration notes can stay as history once the issue body carries the
   correction.
4. **`2026-04-10-editor-core`** (open) — `notes/01_client-side-rendering.md` plans
   to "port custom tags to the browser". → Port the native constructs instead.
5. **`2026-04-10-view-modes`** (open) — WYSIWYG design + `subtasks/03_true-wysiwyg.md`
   map "custom tags as interactive blocks". → Retarget node mapping to GFM
   alerts / `<details>`.
6. **`2026-04-10-editor-diagrams`** (in-progress) — `notes/01_excalidraw.md` +
   `subtasks/10_embeds/30_excalidraw.md` design the Excalidraw embed as
   `:::excalidraw{src="…"}` built on `src/custom-tags/` (deleted). → Re-base on
   the embed/asset preprocessor path (`[[path]]` family), per the brainstorm's
   reference-architecture principle.
7. **`2026-04-10-editor-advanced`** (open, minor) — `subtasks/01_slash-commands.md`
   lists a `/callout` slash command. → Fine to keep only if it inserts a GFM alert.

## HISTORICAL / OK (leave)

`2026-07-03-skill-custom-tags-staleness` (this issue), `2026-04-20-custom-tags`
(dropped, carries the reversal), `2025-06-25-components` (done),
`2025-06-25-claude-skills` (done — skill prose fixed via our subtask 40).

## FALSE POSITIVES

`2026-04-10-issues-layout` and `2026-04-26-framework-as-cli-tool` — "callout"
meaning *a note to readers*, not the tag.
