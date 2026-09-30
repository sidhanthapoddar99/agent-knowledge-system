---
title: "Server lifecycle"
---

This page explains how a server process starts, finds an existing server instead of starting a second one, runs in the background, shuts down, and is listed and stopped from anywhere on the machine. One installed binary can run servers for several projects at once, and all of this works through records in the machine home, `~/.agentks/`. The commands themselves are in the user guide's [CLI reference](../../user-guide-2/65_cli-reference/01_overview.md).

## The run record

When a server is listening, it writes a run record, `~/.agentks/run/<project key>.json`, atomically:

```json
{ "format": 1, "project": "/home/sid/projects/acme/docs", "config": "/home/sid/projects/acme/docs/config",
  "key": "8c1f...", "port": 24817, "pid": 41233, "started": "2026-10-04T09:12:00Z", "engine": "1.0.0",
  "share": false, "log": "/home/sid/.agentks/run/8c1f....log" }
```

| Field | Meaning |
|---|---|
| `format` | The record's format version. A record of another format is not read best effort |
| `project`, `config` | The project root and its config folder |
| `key` | The project key, a hash of the canonical config folder path |
| `port`, `pid` | Where the server listens, and its process |
| `started`, `engine` | When it started, and which engine version serves |
| `share` | Whether it runs in share mode |
| `log` | Its log file |

The type is `RunRecord` in `apps/agentks-engine/crates/server/src/lifecycle.rs`. Only the process that wrote a record removes it.

## A record is trusted only when the probe answers

A process id can be reused by another program after a crash. So the server never trusts a record's `pid` alone. A server is live when its port answers the health probe, `GET /api` without an upgrade, with `426` and **this project's key** ([HTTP routes](./05_http-routes.md)). `apps/agentks-engine/crates/server/src/probe.rs` sorts every answer into three cases: nothing there, another program, or an agentks server with its project key. The probe cannot be faked by accident, and it needs no platform code.

## Start

`agentks start` calls `serve`, in `apps/agentks-engine/crates/server/src/serve.rs` and `apps/agentks-engine/crates/server/src/run.rs`:

1. **Lock.** Take the file lock `run/<project key>.lock`. It is held from the check below until the record is written. So two starts of one project at the same moment give one server: one wins, and the other attaches.
2. **Check for a running server.** Read the record. If its port answers the probe with this project's key, **attach**: print the address and exit `0`.
3. **Clean up.** A record whose server does not answer is stale. Remove it.
4. **Choose the port** ([stable ports](./40_stable-ports.md)).
5. **Bind** `127.0.0.1` and `::1` on that port. A port held by another agentks project, or by another program, is an error that names the holder and the fixes. The server never moves to another port.
6. **Pre-warm** the index and the git dates.
7. **Write the run record,** release the lock, and print the address.
8. **Serve** until Ctrl-C, SIGTERM or `agentks stop`.

**Attaching never transfers ownership.** Ctrl-C in a terminal that attached only detaches that terminal. It never stops the server another command started.

## Detach

`agentks start --detach` runs the server in the background. It does not fork, because forking a running Rust process is unsafe, and because the server crate must not know the CLI's flags. Instead it:

1. runs the same command line again, with the environment variable `AGENTKS_DETACHED_CHILD=1`;
2. puts that child in its own process group, with no console window on Windows;
3. appends the child's output to the run log;
4. waits until the probe answers, then returns the address, or returns an error that names the log.

So the launching command returns only after the server really answers.

## Shutdown

Ctrl-C, SIGTERM and `agentks stop` all end the same way:

1. Stop accepting connections.
2. Close every socket with `1001`, "server shutting down". Tabs show that they are disconnected and reconnect when a server returns.
3. Write back every dirty live document ([live documents](../30_collaboration/05_live-documents.md)), and flush the caches that live on disk ([caching](../20_caching/01_overview.md)).
4. Remove the run record.
5. Exit.

A second Ctrl-C exits at once.

## ps and stop

**`agentks ps`** reads every record in `~/.agentks/run/` and checks each with the probe. A stale or unreadable record is removed. It lists the project, the port, the process id, the uptime and whether share mode is on. It works from any folder, because the records are machine-wide.

**`agentks stop`** finds servers by project, or all of them with `--all`. It sends each one SIGTERM and waits up to 10 seconds, then reports which ones stopped. It exits `1` when no server was running.

## Logs

Each server writes its log to `~/.agentks/run/<project key>.log`, and `agentks logs` prints or follows it. The log rotates at 10 MB and keeps one old file.

The log never holds access keys, session ids, cookies or file contents. A render request is logged by its path, never its text.

## Related

- [Stable ports](./40_stable-ports.md) — how the port in the record is chosen.
- Where `~/.agentks/` lives is part of [the engine](../10_engine/01_overview.md)'s core. What the caches in it hold is in [caching](../20_caching/01_overview.md).
