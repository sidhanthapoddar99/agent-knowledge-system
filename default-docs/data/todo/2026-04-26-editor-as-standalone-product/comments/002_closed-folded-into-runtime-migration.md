---
author: claude
date: 2026-05-08
---

## Closed — folded into `2026-05-08-runtime-stack-migration`

Closing this issue. The "extract editor as standalone Tauri+Rust product" direction is no longer the active path. Instead, the editor is treated as **phase 3** of the broader runtime stack migration:

- **Phase 3a (preferred)**: editor lives inside the new Go binary. y-go (Yjs port) handles server-side CRDT; CodeMirror stays as a JS island. Single binary, single process, no separate desktop app.
- **Phase 3b (fallback)**: if y-go proves insufficient, defer the editor entirely from v1 of the new framework — at which point this issue's Tauri+Rust direction could be revived as a genuinely separate product.

The Tauri+Rust architecture remains a *valid* future option but stops being v1 scope. Decision deferred to phase 3 of the runtime migration spike.

### What was useful here

- The **two-product split** thinking (docs viewer ≠ editor) — partially preserved; in the runtime migration the docs-viewer part is the binary's primary surface, with the editor as an optional surface.
- The **yrs (Rust Yjs port)** evaluation — relevant if phase 3b is chosen; otherwise we use y-go.
- The **integration-via-three-methods** comment (`comments/001_integration-with-three-methods.md`) — the three usage methods got carried over to the runtime migration issue.

### Action

- Status → `closed`.
- `01_tauri-architecture.md` note kept for reference if phase 3b ever revives this direction.
- `01_auth-and-access-control` subtask (still open) cancelled — auth/access for the editor is a phase 3 concern under the runtime migration if/when the editor lives in the binary.

### Cross-reference

Successor issue: [`2026-05-08-runtime-stack-migration`](../../2026-05-08-runtime-stack-migration/issue.md) — see `notes/discussion/03_migration.md` (phase 3) for the editor decision tree.
