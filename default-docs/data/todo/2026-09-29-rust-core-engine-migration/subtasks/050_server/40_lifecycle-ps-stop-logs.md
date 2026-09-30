---
title: "Lifecycle — start, attach, detach, shutdown, and machine-wide ps, stop and logs"
status: in-progress
---

With one global install, one machine may run servers for several projects at once. The user needs to see them all (`agentks ps`), stop any of them (`agentks stop`), read their logs, and never start a second server for a project that already has one. This leaf builds the server lifecycle and the run records in `~/.agentks/run/` that make that possible. It replaces today's viewer lifecycle, which drives Astro through Bun.

# 01 To Do
- [ ] **Run record** `~/.agentks/run/<project key>.json`, written atomically when the server is listening:
      ```json
      { "format": 1, "project": "/home/sid/projects/acme/docs", "config": "…/docs/config",
        "port": 24817, "pid": 41233, "started": "2026-10-04T09:12:00Z", "engine": "1.0.0",
        "share": false, "log": "/home/sid/.agentks/run/8c1f….log" }
      ```
- [ ] **Start** (`agentks start`):
    - [ ] Read the record. If its process is alive and `GET /api` on its port answers `426` with this project's key ([050/10](./10_http-and-routes.md)) → attach: print the address, exit `0`. Ctrl-C then only detaches (it does not own the server).
    - [ ] A record whose process is dead is stale → remove it.
    - [ ] Otherwise bind the stable port ([050/45](./45_stable-ports.md)), pre-warm (index, git dates), write the record, then print the address.
    - [ ] `--detach`: run the server as a background process whose stdout and stderr go to the log file; the launching command waits until the record exists and the probe answers, then exits. On Windows, use a detached process without a console window.
    - [ ] `--open`: open the browser at the address.
- [ ] **Graceful shutdown** on Ctrl-C, SIGTERM or `agentks stop`: stop accepting, close sockets with `1001`, flush the git-dates file and `build-cache.json`, remove the run record, exit. A second Ctrl-C forces exit.
- [ ] **`agentks ps [--json]`**: every record on the machine, checked live (process alive and probe answers); stale ones removed. Columns: project, port, pid, uptime, share mode.
- [ ] **`agentks stop [--project PATH | --all]`**: signal the process (SIGTERM; `TerminateProcess` on Windows after a polite local stop request), wait up to 10 s, report.
- [ ] **`agentks logs [--follow]`**: print or tail this project's log file. Logs rotate at 10 MB, keeping one old file.
- [ ] **Log format:** one line per event, timestamp, level, target. Never log access keys, cookies or file contents ([060/40](../060_collaboration/40_access-keys.md)).
- [ ] **Locking:** writes to `run/` take a short file lock; two starts of one project at once → one wins, the other attaches.

## Guardrails
- `start` never clones anything and never needs a framework checkout; the engine and client are inside the binary.
- Attaching never transfers ownership: Ctrl-C in an attached terminal never stops the server (today's behaviour, kept).

## Done when
- Starting a project twice prints the same address and leaves one process.
- `agentks ps` from any folder lists servers of two different projects; `agentks stop --all` stops both and removes their records.
- Killing a server with `kill -9` leaves a stale record that the next `ps` or `start` removes.
- `start --detach` returns only after the server answers; `logs --follow` shows its requests.
- Works on Linux, macOS and Windows (CI matrix, [170/10](../170_testing/10_rust-tests.md)).

# 02 Status and Result
Review: start, attach, detach, shutdown, run records, `ps` and `stop` are built; `logs`, `--open` and the log format belong to the CLI, and `stop` on Windows is not built.

## Result
- `src/lifecycle.rs`: `RunRecord` with serde and a `format` field on disk (`RUN_RECORD_FORMAT`), written atomically once listening, removed on shutdown only by the process that wrote it. `running_servers` checks each record with the `426` probe and removes stale or unreadable ones. `stop` sends SIGTERM (Unix, through `rustix`), waits up to 10 s, and returns the ones that stopped.
- `src/run.rs`: `serve_backend` (what `serve` calls): attach when this project's record answers the probe; a file lock `run/<key>.lock` held from the check to the record, so two starts at once give one server; choose the port; bind; write the record; wait for Ctrl-C or SIGTERM (a second Ctrl-C exits at once); shut down; remove the record. `StopOn::Channel` lets tests and embedders stop it.
- `--detach`: re-runs this program with the same arguments and `AGENTKS_DETACHED_CHILD=1`, in its own process group (no console window on Windows), output appended to the run log (rotated at 10 MB, one old file kept); returns `Detached` once the probe answers, or an error naming the log.
- `src/probe.rs`: `probe(port)` → nothing, another program, or an agentks server with its project key.
- Tests: `start_attach_ps_conflicts_and_stop` (start, `ps`, second start attaches, another project on the port and a foreign holder both fail), record round trip, dates.
- Left: `agentks logs` and `--open` in the CLI (070/30), the CLI's tracing subscriber and log line format, `stop` on Windows, flushing caches on shutdown (needs a site API).

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — server lifecycle in `agentks-server`, commands in `agentks-cli` ([070/30](../070_cli/30_start-and-dev-mode.md)).

**Read first:**
- [Sync engine and server, section 08](../../notes/02_engine/04_sync-engine-and-server.md) — several projects on one machine.
- [Machine home, sections 01 and 06](../../notes/02_engine/06_machine-home-and-build-cache.md) — `run/` records, concurrency.
- [Rust CLI, section 02](../../notes/02_engine/05_rust-cli.md) — `start`, `stop`, `ps`, `logs`.
- Today's lifecycle, for behaviour to keep (attach, detach, Ctrl-C ownership): [viewer.rs](../../../../../../agent-ks-cli/src/viewer.rs), [lifecycle.rs](../../../../../../agent-ks-cli/src/viewer/lifecycle.rs).

**Depends on:** [050/10](./10_http-and-routes.md), [050/45](./45_stable-ports.md), [040/50](../040_caching/50_document-cache-by-location.md), [040/80](../040_caching/80_cache-format-versions.md).
**Unblocks:** [070/30](../070_cli/30_start-and-dev-mode.md), [040/90](../040_caching/90_clean-and-reset.md) (reads run records).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): server commands such as `agentks ps` stay part of the CLI.
- Proposed (claude, 2026-09-30), adopted here: `run/` records and machine-wide `ps` and `stop`.
- Decided (claude, 2026-09-30): the live check is the process plus the `426` probe; logs rotate at 10 MB.
- Decided (claude, 2026-10-01): a server is live when its port answers the `426` probe with its key; the pid is not checked, because the probe already proves it and a pid check needs platform code.
- Decided (claude, 2026-10-01): `--detach` re-runs the same command line with `AGENTKS_DETACHED_CHILD=1` instead of forking, because forking a Rust process is unsafe and the server crate must not know the CLI's flags.
- Decided (claude, 2026-10-01): `ServeOptions` gains `configured_port`, filled by the CLI from `ProjectConfig::configured_port()`, because `Site` does not expose its config; requested a site accessor so this field can go.

# 05 Notes & Analysis

## Watch out
- A pid can be reused by another program after a crash. The probe (which returns the project key) is what proves the record is live; never trust the pid alone.
- `RunRecord` in `crates/server/src/lifecycle.rs` has no serde derives yet. Add them together with its `format` field, set from `agentks_core::formats::RUN_RECORD_FORMAT`.
