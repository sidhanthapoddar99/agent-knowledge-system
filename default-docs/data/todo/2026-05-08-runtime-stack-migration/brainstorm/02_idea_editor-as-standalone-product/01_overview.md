---
title: "Editor as a standalone product — proposal and how it folded in"
sidebar_label: "01 · Overview"
---

> **Resolved →** folded into this issue as migration **phase 3** (see `brainstorm/04_discuss_stack-and-migration/03_migration.md`); the three-methods integration thinking was absorbed into `notes/deployment-methods/`.

# Editor as a standalone product

*Provenance: migrated from the cancelled issue `2026-04-26-editor-as-standalone-product` (filed 2026-04-26, status `cancelled`, priority `low`). This was one branch of the larger "how should we distribute and run the framework?" deliberation that converged here, on the runtime-stack migration.*

## The proposal

Split the live editor out of the Astro docs framework into its **own product**. The framing:
the framework's job is *rendering* a published site; the editor's job is *authoring* content.
They share a content directory (`dynamic_data/` / `default-docs/`) and nothing else — the
current coupling is incidental, not architectural.

Post-split shape: the framework becomes a pure renderer, and the editor becomes a **Rust core**
(CRDT sync, file I/O, presence, search) exposed through three surfaces — a headless server
binary, a Tauri desktop app, and a shared web frontend. Any of them authors into the same
directory layout the renderer reads. Details in `02_explore_tauri-rust-core.md`.

## Why a standalone editor was attractive

| Argument | The pull |
|---|---|
| **No real Astro dependency** | The editor is CodeMirror 6 + Yjs CRDT + a file-system server. Astro is just the host today, not a design partner. |
| **Different lifecycles** | The framework iterates on layouts / themes / content types; the editor iterates on authoring UX, CRDT, multi-user. Bundling slows both. |
| **Different distribution shapes** | Framework wants to be a package consumed across many docs projects; the editor wants to be a downloadable app + optional self-hostable server. Different cadences. |
| **Performance ceiling** | The editor's hot paths (file watching, CRDT merges, full-text search, AST-on-save) are CPU/IO bound; a Rust core raises the ceiling over Node-in-Astro. |

Crucially, the original issue filed itself as **future direction, not in-flight work** — an
explicit guard against the second-system trap (rebuild the working thing in a fancier stack,
ship neither). The stated preconditions to *start*: (1) the framework has a real consumer
beyond this repo, (2) the editor has demand beyond "I want it for my own docs," and (3) a
*measured* bottleneck justifies the language switch — none of which held at filing time
(Yjs-in-JS was already fast; the real pain was markdown rendering and file-watching).

## Why it folded into the migration

The runtime-stack migration answered the "how do we run/distribute the framework?" question a
different way: **one Go binary that embeds a Vite-built frontend** — not a Rust editor product
living beside an Astro renderer. Once the runtime is a single Go process, the editor stops being
a separate-product problem and becomes **phase 3** of the migration (`brainstorm/04_discuss_stack-and-migration/03_migration.md`):

- **Phase 3a (preferred)** — the editor lives *inside* the Go binary: `y-go` for server-side
  CRDT, CodeMirror as a JS island, one binary, one process, no separate desktop app.
- **Phase 3b (fallback)** — if `y-go` is too immature, defer the editor from v1 entirely; at
  *that* point this issue's Tauri + Rust direction could be revived as a genuinely separate
  product.

So the Tauri + Rust architecture is not wrong — it is **deferred**, demoted from v1 scope to a
fallback that only activates if the single-binary route fails. What carried over versus what was
parked is tracked in the sibling files:

- The **two-product split** (viewer ≠ editor) — *partially* preserved: in the migration the
  docs-viewer is the binary's primary surface and the editor becomes an optional surface, rather
  than two shipping products.
- The **Tauri + Rust-core** exploration — `02_explore_tauri-rust-core.md` (relevant again only
  under phase 3b).
- The **auth / access-control** questions — `03_discuss_auth-and-access-control.md` (now a
  phase-3 concern, only if the editor lives in the binary).
- The **three-integration-methods** thinking — `04_explore_three-integration-methods.md`; this is
  the piece that graduated cleanly, into `notes/deployment-methods/`.
