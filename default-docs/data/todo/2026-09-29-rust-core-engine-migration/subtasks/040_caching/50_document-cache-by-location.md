---
title: "Document cache by location — the project key and relative-path addressing"
status: open
---

Several projects live on one machine, and each runs its own server. Every cache, every running-server record, every stable port and every browser storage name must say which project it belongs to, and must never be mixed up with another project's. This leaf defines the **project key** and how cached documents are addressed inside it: by path relative to the project root, with content hashes deciding freshness. It also decides what happens when a project or a file moves.

# 01 To Do
- [ ] **The project key.** `project_key = first 16 hex chars of BLAKE3(canonical absolute path of the project's config folder)`. Canonical means symlinks resolved and, on Windows, a normalised drive letter and case. Put it in the core; the server, the CLI, the build cache, the run records ([050/40](../050_server/40_lifecycle-ps-stop-logs.md)), the stable port ([050/45](../050_server/45_stable-ports.md)) and the manifest all read it from there.
- [ ] **Send it to the browser.** The manifest carries `project.key`, so the client can put it into every IndexedDB and local-storage name ([080/40](../080_ui-and-client/40_websocket-client.md), [090/10](../090_frontend-performance/10_ui-state-persistence.md)).
- [ ] **Addressing inside a project.** Index entries, error records and dependency records use the path relative to the project root, with `/` separators on every platform. Absolute paths never leave the process (they would leak the user's home folder into pages and logs).
- [ ] **A moved project** gets a new key and starts with a cold cache. Log one line at start: "new project location; the cache is cold". The old key's folder is removed by the next `agentks cache clean` because its recorded project folder no longer exists ([040/90](./90_clean-and-reset.md)).
- [ ] **A moved or renamed file** inside a project: its content hash is unchanged, so its rendered body can be reused only if nothing path-dependent changed. Relative links resolve from the file's location, so the render key must include the page's own path. Add the path to `render_key` in [040/10](./10_cache-keys-and-dependencies.md).
- [ ] **Machine settings.** Define `~/.agentks/settings.json` with the keys this group needs: `cache.memory_mb` ([040/30](./30_in-memory-cache.md)). Unknown keys are a warning, as with `.env`. Other groups add their keys here.
- [ ] **Tests**, below.

## Guardrails
- One function computes the key; nothing re-derives it.
- The project key is an identifier, not a secret. Never use it for access control; that is [060/40](../060_collaboration/40_access-keys.md).

## Done when
- The same project opened through a symlink and through its real path gets the same key (test).
- Moving a fixture project to another folder gives a new key and a cold start; `agentks cache clean` then reports the old key's cache as removable.
- Renaming a page that contains relative links re-renders it, and its links still resolve correctly (test).
- No absolute path appears in any `/api` response for a fixture project (a test greps every response for the fixture's absolute root).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the core (project key, relative paths) and the cache crate (settings).

**Read first:**
- [Machine home, section 01](../../notes/02_engine/06_machine-home-and-build-cache.md) — "the project key is a hash of the project's canonical config folder path".
- [Project config, section 02](../../notes/02_engine/02_project-config.md) — how a command finds the project.
- [Client application, section 05](../../notes/03_frontend/02_client-application.md) — storage names carry the project key.
- [Sync engine and server, section 08](../../notes/02_engine/04_sync-engine-and-server.md) — stable ports.

**Depends on:** [030/30 config loader](../030_rust-engine/30_config-loader-and-settings-schema.md).
**Unblocks:** [040/40](./40_build-cache-on-disk.md), [050/40](../050_server/40_lifecycle-ps-stop-logs.md), [050/45](../050_server/45_stable-ports.md), the browser storage leaves in 080 and 090.

# 04 Decisions
- Decided (claude, 2026-09-30): each project keeps a stable port, and every browser storage name also carries the project key ([server note](../../notes/02_engine/04_sync-engine-and-server.md), [client note](../../notes/03_frontend/02_client-application.md)).
- Decided (claude, 2026-09-30): the key is 16 hex characters of BLAKE3 over the canonical config path; the page's own path is part of its render key.

# 05 Notes & Analysis

## Watch out
- A project on a case-insensitive file system (macOS default, Windows) reached by two spellings of one path must get one key. Canonicalise before hashing.
- Network drives and WSL paths under `/mnt/c/...`: canonicalisation must not fail on them. Fall back to the absolute path, and log it.
