---
title: "Byte-identity probe"
status: done
agent: sol
---

# Goal
Confirm the swapped reader emits the same bytes as the old one.

# Inputs
- `working/010_reader.md`

# Expected Outcome
Survivors and kills, the exact command, the collected count.

# Outcome
Identical on all 41 fixture files.

**This file is at level 4 — the deepest the depth budget allows.** A producer
folder inside a child log's `working/`. Anything below this is dropped by the
loader without an error, which is why the budget is stated rather than
discovered.
