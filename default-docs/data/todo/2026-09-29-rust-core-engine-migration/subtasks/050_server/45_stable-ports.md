---
title: "Stable ports — one port per project, kept across restarts"
status: open
---

A browser keeps storage per origin, and the port is part of the origin. If a project's server moves to another port, its browser cache and its saved UI state (open sidebar folders, filters) are lost; worse, a project that takes over another project's old port could see that project's stored state. So **each project keeps one stable port**. When the port is taken by something else, `agentks start` fails with a clear message and the fix, instead of moving silently.

# 01 To Do
- [ ] **Choose the port, in this order:**
    1. `--port N` on the command line (one run only; warn that browser storage for the usual port will not be used).
    2. `AGENTKS_PORT` in `config/.env`, then `server.port` in `site.yaml` ([project config, section 05](../../notes/02_engine/02_project-config.md)).
    3. The port recorded for this project in `~/.agentks/ports.json`.
    4. Otherwise derive one: `20000 + (first 8 bytes of the project key as a number) mod 10000`. If that port is already recorded for another project, take the next number not recorded. Record the result in `ports.json` so it never changes.
- [ ] **`~/.agentks/ports.json`**: `{ "format": 1, "ports": { "<project key>": { "port": 24817, "project": "/path" } } }`, updated under a file lock, atomically.
- [ ] **When binding fails:**
    - [ ] The port answers the `426` probe with this project's key → attach ([050/40](./40_lifecycle-ps-stop-logs.md)).
    - [ ] Another agentks project answers → error naming that project and both fixes: stop it, or set `server.port` for one of them.
    - [ ] Something else holds it → error naming the port and the fixes: free it, or set `server.port`. Never pick another port on its own.
- [ ] **Bind both loopback addresses** (`127.0.0.1` and `::1`) on the same port; if IPv6 is unavailable, IPv4 alone is fine.
- [ ] **Show the port** in `ps`, in the start message, and in the manifest (the client uses `project.key`, not the port, for storage names — [040/50](../040_caching/50_document-cache-by-location.md)).
- [ ] **`cache clean`** removes `ports.json` entries whose project folder no longer exists ([040/90](../040_caching/90_clean-and-reset.md)).

## Guardrails
- Never move to "the next free port" silently. That was the old rule and it caused the bug this leaf exists to fix.
- The port is not a security boundary. Access is [050/50](./50_security.md) and [060/40](../060_collaboration/40_access-keys.md).

## Done when
- A project started, stopped and started again gets the same port (test), also after a reboot (the record is on disk).
- Two new projects whose derived ports collide get different ports, each stable afterwards (test with an injected key).
- With the port held by `nc -l`, start fails with the documented message and exit code `1`.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/agentks-server/`.

**Read first:**
- [Sync engine and server, section 08 and decisions](../../notes/02_engine/04_sync-engine-and-server.md) — the stable-port decision and why.
- [Client application, section 05](../../notes/03_frontend/02_client-application.md) — one cache per origin; storage names carry the project key.
- [Project config, sections 03 and 05](../../notes/02_engine/02_project-config.md) — `server.port`, `AGENTKS_PORT`.

**Depends on:** [040/50](../040_caching/50_document-cache-by-location.md).
**Unblocks:** [050/40](./40_lifecycle-ps-stop-logs.md), [070/30](../070_cli/30_start-and-dev-mode.md).

# 04 Decisions
- Decided (claude, 2026-09-30): each project keeps a stable port; a taken port is an error, never a silent move ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): an unset port is derived from the project key into 20000–29999 and recorded in `~/.agentks/ports.json`.

# 05 Notes & Analysis

## Watch out
- `ports.json` is a new file in the machine home; the [machine home note's layout](../../notes/02_engine/06_machine-home-and-build-cache.md) does not list it yet. Add it when that note is next revised.
- Ports 20000–29999 avoid the common dev ports (3000, 5173, 8080) and the ephemeral range on Linux (32768+). Windows' ephemeral range starts at 49152.
