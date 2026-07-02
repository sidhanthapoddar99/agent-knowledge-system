---
title: "Auth and access control — the deferred gating question"
sidebar_label: "03 · Auth + access control"
---

# Auth and access control

*Lineage: this was a subtask of the cancelled issue, itself absorbed from an even earlier deleted
issue `2025-06-25-editor-security`.* The through-line is a **timing argument**, not a feature
list: auth only becomes meaningful once the editor is a **standalone deployable**. In the
Astro-mounted setup the editor is dev-only, so gating it would be premature — hence the question
kept getting deferred rather than built.

## The constraint that framed it

Design target: *gate access without inventing a full user system* — "small ops surface, easy to
self-host." That constraint is what keeps this from ballooning into accounts / roles / RBAC. Two
mechanisms were sketched against it:

| Mechanism | Sketch | For |
|---|---|---|
| **Password protection** | Single shared secret in config / env | Solo or trusted-team self-host |
| **OAuth (GitHub / Google)** | Optional integration | Hosted / team setups |
| **Access-code invites** | Single-use codes, entry form on load, expiry / revocation | Inviting collaborators without provisioning accounts |

## Open questions left standing

- Where is the trust boundary enforced — the server binary's HTTP/WS layer, or the container edge?
  (The three-methods thinking pinned it at the container's HTTP/WS boundary for the Docker case —
  see `04_explore_three-integration-methods.md`.)
- Do access codes need real revocation infrastructure, or is a config-file list enough for the
  "small ops surface" target?
- Does OAuth pull in a session store that violates the "no full user system" constraint?

## Status now

Cancelled along with the parent. Auth/access-control is now a **phase-3 concern under the runtime
migration** — it only matters *if* the editor ends up living inside the Go binary (phase 3a) or is
revived as a separate product (phase 3b). Until an editor surface actually ships as something
network-reachable, the gating question stays parked. The "small ops surface, single shared secret,
optional OAuth, single-use invite codes" shape is the design to revive when it does.
