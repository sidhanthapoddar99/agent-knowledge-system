---
title: Validator — 2–5 digit rule + numeric-value collision key
state: closed
---

In `scripts/docs/check.mjs`:

- Accept `^(\d{2,5})_`; reject 1-digit and >5-digit prefixes with a clear message.
- Switch the collision check to key on the **numeric value** (`parseInt`), not the prefix
  string — so `02_` and `002_` (both = 2) are caught as colliding instead of silently
  tying in sort.

Exit code stays 0 clean / 1 on errors.
