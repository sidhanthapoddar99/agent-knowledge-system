---
title: "Diagram documents"
---

This page explains how several people edit one diagram together. A canvas is not text, so each diagram format gets the sync shape that fits it, and one format gets less than live merging, on purpose. Whatever the shape in memory, the file on disk stays in the diagram's own format, readable by the diagram's own tools.

## One shape per format

| Format | Live document shape | Concurrent edits | Disk changes merge |
|---|---|---|---|
| Mermaid (`.mmd`, `mermaid` fences) | `Y.Text`, like markdown | Merged character by character | As text ([disk and live document merge](./15_disk-and-live-document-merge.md)) |
| Graphviz (`.dot`, `dot` fences) | `Y.Text`, like markdown | Merged character by character | As text |
| Excalidraw (`.excalidraw`, JSON) | `Y.Map`s of elements, shared app state and embedded files | Merged element by element | Element by element |
| tldraw | A `Y.Map` of tldraw's records | Merged record by record | Element by element |
| draw.io (`.drawio`, XML) | No live merge: presence, and whole-file saves | The second save gets `conflict` | Whole-file replace, with a conflict notice |

The live document's kind is `diagram` for the canvas formats (`DocKind` in `apps/agentks-engine/crates/sync/src/docs.rs`).

## Text diagrams

Mermaid and Graphviz sources are text, so they sync as `Y.Text` exactly like a markdown page ([live documents](./05_live-documents.md)). A diagram fence inside a page is part of that page's document, so it needs no extra work. The editor shows the live render beside the source.

## Excalidraw

An `.excalidraw` file is JSON: a list of elements, some app state, and embedded image files. The live document holds:

- a `Y.Map` of elements, keyed by element id, each value being the element's JSON with its `version`;
- a `Y.Map` for the shared parts of the app state, such as the background colour and the grid;
- a `Y.Map` of the embedded image files.

Remote changes reach the editor through Excalidraw's `updateScene`. When two people change the same element at once, the higher `version` wins, then the higher `versionNonce`, which is how Excalidraw's own reconciliation decides. Two people moving different shapes at the same time keep both moves.

Embedded images can be large base64 blobs. Each is synced once, by its id, and never sent again on every change.

On write-back, the document is serialised back to the `.excalidraw` JSON, so the saved file opens in excalidraw.com with the same meaning.

## tldraw

tldraw's store is a set of records keyed by id. The live document puts them in a `Y.Map`, following tldraw's documented Yjs sync pattern, and serialises them back to tldraw's file format on write-back.

## draw.io: presence and safe saves only

The embedded diagrams.net editor runs in an iframe and offers only two operations: load a whole file, and save a whole file. It has no way to apply someone else's change to one element while a person is editing. Reloading the whole diagram under someone's cursor would throw away their action in progress.

So draw.io gets the level of support that is honest:

- **Presence.** Everyone sees who has the diagram open.
- **Whole-file autosave, with `base_hash`.** A save carries the hash of the version the editor loaded ([file writes](../15_server-and-protocol/30_file-writes.md)).
- **Conflicts, not merges.** When two people save at once, one save succeeds. The other gets `conflict`, and that editor reloads with a notice.

## Presence on a canvas

Each person's pointer position and selected element ids travel on the same awareness channel as text cursors ([presence](./20_presence.md)). Excalidraw's `collaborators` API and tldraw's presence records draw them.

## Rules for every diagram format

- **The file keeps its own format.** No agentks-specific wrapper goes inside an `.excalidraw`, `.drawio` or tldraw file.
- **One save path.** Every write-back goes through the server's save path, with its path rules, conflict check and echo suppression.
- **Heavy editors load on demand.** A diagram editor's bundle loads only when a diagram is opened for editing ([performance and offline](../25_frontend/40_performance-and-offline.md)).
