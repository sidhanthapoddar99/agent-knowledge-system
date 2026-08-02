---
title: "Loader and reader"
status: done
agent: claude
---

# Goal
The loader ignored three folders entirely, so their content rendered as an
empty section rather than as a missing feature. Add the reader and the routes.

# Inputs
- `notes/01_decided-architecture.md`
- `brainstorm/01_options/01_approach-a.md` — the shape that won

# Expected Outcome
The change, and what it touched.

# Outcome
Reader lands; every section has a route and a sub-doc page. Two agents ran in
this round and both produced **code**, so neither has a file of its own — the
research and the trade-off argument below are the producers.

Issues found: one, and it is not this round's to fix — the sidebar draws depth
from a constant the loader does not share, so the two can disagree. Detail in
[the handover](../debrief/01_handover.md).
