---
title: "./start self-migration flow in the archived repo"
status: done
---

Shipped 2026-07-08 as the old repo's **final commit** (`f703db8` on
documentation-template `main`, pushed before archiving). The shape evolved
from the original origin-rewrite idea to a cleaner clone-and-replace flow
(the old checkout is retired entirely instead of being rewired in place):

`./start` on the archived repo now runs `deprecation_migrate` before
anything else:

1. Big red deprecation banner (always — even non-interactive; scripted runs
   get warning-only, never a prompt).
2. Interactive Y/n: migrate now?
3. Clones `agent-knowledge-system` **shallow** as a sibling of the old
   folder (skips if it already exists; abort-safe if offline — nothing
   changed on failure).
4. Copies `.env` over (never clobbers an existing one) — CONFIG_DIR wiring
   survives.
5. **Consumer-mode check before any deletion**: CONFIG_DIR must resolve
   OUTSIDE the folder. Only then offers (y/N) to delete the old folder —
   "no data lost" is verified, not asserted. Dogfood checkouts are refused
   with manual steps (their content lives inside the folder).
6. Deletion happens via `exec bash -c` so nothing keeps reading from the
   deleted script; prints the upgrade-complete message + `cd` pointer.

`start.ps1` ports the same flow minus the self-delete (Windows locks a
running script's folder) — it clones, copies `.env`, and prints the exact
`Remove-Item` step. Sandbox-tested: full happy path (clone → .env → delete →
message), dogfood refusal, decline path.
