> → superseded by [2026-09-29-rust-core-engine-migration](../2026-09-29-rust-core-engine-migration/issue.md): the server's lifecycle becomes the Rust engine's and the CLI's job (`agentks start`, `stop`, `ps`), and the current editor is discarded. See [the server note](../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/09_server-websockets-and-editing.md).

## Goal

Right now the editor is bound to the dev server lifecycle. Once it becomes a real long-running server (used in multiple ways beyond static rendering), it needs the usual operational surface.

## Tasks

- [ ] Process manager for the editor server (PM2 or similar)
- [ ] Auto-restart on crash
- [ ] Graceful shutdown handling — close WebSocket connections, save state
- [ ] Health-check endpoint for monitoring
