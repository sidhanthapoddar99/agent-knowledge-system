---
title: "Stable ports"
---

This page explains why each project keeps the same port for good, how that port is chosen, and what happens when it is taken. The code is `apps/agentks-engine/crates/server/src/ports.rs`.

## Why the port must not move

A browser keeps storage per origin, and the port is part of the origin. `http://localhost:24817` and `http://localhost:24818` are two different origins with two separate stores.

The client keeps a lot in the browser: the cached page data in IndexedDB, and each person's UI state, such as open sidebar folders and tracker filters ([the browser cache](../25_frontend/30_browser-cache-and-live-updates.md)). If a project's server moved to another port:

- the project would lose its browser cache and its saved UI state;
- worse, a project that took over another project's old port could see that project's stored state.

So **each project keeps one stable port**, recorded on disk, and the server never moves to "the next free port" on its own. When the port is taken, start fails with a clear message and the fix.

The client adds a second guard: every browser storage name and key carries the project key, which the manifest sends. Storage stays correct even if a port is ever reused. The port is not a security boundary either. Access is decided by [security](./45_security.md) and by access keys.

## How the port is chosen

`choose_port` takes the first of these that gives a port:

| Order | Source | Kept |
|---|---|---|
| 1 | `--port N` on the command line | This run only. The browser storage of the usual port is not used |
| 2 | `AGENTKS_PORT` in `config/.env`, then `server.port` in `site.yaml` | As long as the config says so |
| 3 | The port recorded for this project in `~/.agentks/ports.json` | For good |
| 4 | A port derived from the project key, then recorded | For good, from now on |

The CLI reads the configured port from the project's config and passes it in, because the server does not read config itself. How `.env` may override `site.yaml` is in [configuration](../../user-guide-2/35_configuration/01_overview.md).

**The derived port** is `20000 + (a number taken from the project key, modulo 10000)`, so it falls in 20000 to 29999. That range avoids the common development ports (3000, 5173, 8080) and the ephemeral ports Linux hands out (32768 and up). If another project already recorded the derived port, the project takes the next number nobody recorded, wrapping inside the range. A full range is an error.

The project key is a hash of the project's canonical config folder path. So a project that moves to another folder gets a new key, and with it a new derived port.

## ports.json

```json
{ "format": 1, "ports": { "8c1f...": { "port": 24817, "project": "/home/sid/projects/acme/docs" } } }
```

- The server reads and writes it under a file lock, and writes it atomically.
- A file of another format, or one that cannot be read, is replaced by a new table. A store of another format is rebuilt, never read best effort. The ports of other projects are then derived again.

## Binding

The server binds both loopback addresses, `127.0.0.1` and `::1`, on the same port. If the machine has no IPv6, IPv4 alone is fine. If `::1` is held by something else, the port counts as taken.

## When the port is taken

| Who holds the port | What `start` does |
|---|---|
| This project's own server (the probe answers with this project's key) | Attaches to it and prints its address ([server lifecycle](./35_server-lifecycle.md)) |
| Another agentks project's server | Fails with an error naming that project, and both fixes: stop it, or set `server.port` for one of the two |
| Another program | Fails with an error naming the port, and both fixes: free the port, or set `server.port` |

When `start` fails, the exit code is `1` and the port does not change. Picking another port silently would cost the project its browser storage, as explained at the top of this page.

## Where the port shows up

- In the start message and in `agentks ps`.
- In the run record ([server lifecycle](./35_server-lifecycle.md)).
- In the manifest, as `project.port`. The client uses `project.key`, not the port, to name its storage.
