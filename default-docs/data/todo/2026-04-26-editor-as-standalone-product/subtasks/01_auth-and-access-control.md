---
title: "Auth and access control"
state: open
---

Absorbed from the original `2025-06-25-editor-security` top-level issue (now deleted) — folded in here because authentication and access control only become meaningful once the editor is its own deployable product. In the current TS-in-Astro setup, the editor is dev-only and gating it would be premature.

## Goal

Once the editor runs as a standalone server (and not just a dev-tool inside Astro), it needs a way to gate access without inventing a full user system. Aim for "small ops surface, easy to self-host."

## Authentication

- [ ] Simple password protection (single shared secret in config / env)
- [ ] Optional OAuth integration (GitHub, Google) for hosted/team setups

## Access-code invite system

- [ ] Generate single-use access codes for collaborators
- [ ] Code-entry form on editor load
- [ ] Code expiry / revocation

## When this becomes relevant

Only after the parent issue's server-binary surface ships. Until then the current Astro-mounted editor stays dev-only and gating is N/A.
