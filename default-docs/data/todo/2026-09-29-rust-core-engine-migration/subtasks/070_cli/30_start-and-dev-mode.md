---
title: "Start and dev mode — `start`, `stop`, `ps`, `logs`, `doctor`"
status: open
---

`agentks start` is the command people run most: check the project, install missing locked libraries, build the index and serve. With one global install there is no framework checkout to clone or update, and one machine may run several projects. This leaf builds the server commands on top of the lifecycle in [050/40](../050_server/40_lifecycle-ps-stop-logs.md), plus `doctor`, and the state-1 dev mode that lets maintainers run the engine behind the Vite dev server.

# 01 To Do
- [ ] **`agentks start [--detach] [--port N] [--open] [--share] [--public-url URL]`**:
    1. Find the project (config rule) and run the version gate ([020/60](../020_content-contract/60_engine-version-gate.md)); outside the range → the migration message, exit `1`.
    2. Library sync: install missing locked commits, resolve new or changed `dep.yaml` entries, never move an existing pin ([120/20](../120_libraries/20_fetch-and-resolve.md)).
    3. Attach if this project already has a server; otherwise start one on the stable port ([050/45](../050_server/45_stable-ports.md)).
    4. Print the address (and in share mode, the owner link).
- [ ] **`agentks stop [--project PATH | --all]`**, **`agentks ps [--json]`**, **`agentks logs [--follow]`**: thin commands over [050/40](../050_server/40_lifecycle-ps-stop-logs.md).
- [ ] **`agentks doctor`**: report only — config valid, version gate, `dep.lock` against the library cache, the stable port free or owned by this project, and whether Bun or Node (for `build`) and `uv` or Bun (for `migrate`) are on the PATH. One line per check, `--json` for agents.
- [ ] **`agentks resolve-context`**: the selected project root, config and content folders, and now the project key and port.
- [ ] **Dev mode (state 1):** `agentks start --dev-origin http://localhost:5173` (a flag only a development build accepts, or an environment variable set by `ctl dev`) makes the server skip serving the embedded client and accept the Vite origin on the socket. The main repository's `ctl dev` starts both ([010/00](../010_project-setup/00_overview.md)).
- [ ] **Messages** for the common failures: config not found (names the three places searched), port taken (both fixes), a library offline (names `agentks install`).

## Guardrails
- `start` never clones, pulls or updates anything besides locked libraries.
- Ctrl-C stops only a server this command started; an attached terminal only detaches.
- The dev-origin exception is never available in a release build.

## Done when
- In a fresh `agentks init` project, `agentks start` serves the site and `agentks ps` shows it; `agentks stop` stops it.
- `agentks start` in a 0.x project prints the migration message and exits `1`.
- `agentks doctor --json` lists every check with pass or fail.
- `ctl dev` in the main repository serves the client with hot reload against the working-tree engine.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/`.

**Read first:**
- [Rust CLI, sections 02 and 07](../../notes/02_engine/05_rust-cli.md) — server and project commands; runtimes each command needs.
- [Sync engine and server, sections 01 and 08](../../notes/02_engine/04_sync-engine-and-server.md).
- [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) — state 1, the Vite proxy, mise and `data/builds/`.
- Today's viewer commands, for messages and behaviour worth keeping: [viewer.rs](../../../../../../agent-ks-cli/src/viewer.rs), [maintenance.rs](../../../../../../agent-ks-cli/src/viewer/maintenance.rs).

**Depends on:** [070/20](./20_content-commands-port.md), [050/40](../050_server/40_lifecycle-ps-stop-logs.md), [050/45](../050_server/45_stable-ports.md), [120/20](../120_libraries/20_fetch-and-resolve.md).
**Unblocks:** [170/30 end-to-end tests](../170_testing/30_end-to-end.md), [070/90](./90_share-commands.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): server commands stay part of the CLI.
- Decided (sidhantha, 2026-09-30): starting agentks installs missing locked libraries itself.
- Decided (claude, 2026-09-30): dev mode is a development-build-only flag that points the server at the Vite origin.

# 05 Notes & Analysis

## Watch out
- `doctor` used to run a full build; it no longer does. `agentks build` is the build check.
