---
title: "Summary"
---

# State

Deliberate edge-case fixture, left as it is.

# Goal and Trigger

Two edge cases on purpose, so the renderer is tested against them:

1. **A two-digit prefix** — `70_`, beside the three-digit siblings. It must sort
   as 70, between `060_` and `200_`, not lexically.
2. **An unknown kind code** — `nt` is not in the effective set, so the folder
   must render without a symbol and keep the code in its label rather than
   throwing.

It also carries **no `settings.json`**, so its symbol renders the defined grey
that means *no status set* — visibly distinct from `open`.

# Task List

- [x] Exist, and keep existing

# Out of Scope

Being tidy.

# Outcome Summary

Renders. That is the whole assertion.
