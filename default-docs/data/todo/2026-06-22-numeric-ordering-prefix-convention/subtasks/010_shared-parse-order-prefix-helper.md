---
title: Add a shared parseOrderPrefix helper
state: closed
---

Create one helper — `parseOrderPrefix(name) → { sequence, rest }` — that defines the
ordering-prefix grammar (`^(\d{2,5})[_-]`) in a single place: returns the numeric
`sequence` (via `parseInt`) and the prefix-stripped `rest` (for slug/title). This becomes
the only definition of the grammar; loaders, parsers, and the validator all call it.

Put it where both the framework (`astro-doc-code/src`) and the plugin scripts can use the
same logic (shared util module, or mirror with a single source-of-truth comment if they
can't import across that boundary).
