---
title: "Reading half"
status: done
agent: claude
---

# Goal
Read the prefix parser and the depth guard; report every place a wrong input produces a plausible result instead of failing.

# Inputs
- `src/parsers/core/order-prefix.ts`

# Expected Outcome
Findings — each with `file:line`, the failure scenario, and whether it was reproduced.

# Outcome
Three findings, **none reproduced** — this half reads, it does not execute.

1. `order-prefix.ts` — `00-foo` and `00_foo` both parse to `0`; two siblings then
   sort by filename, which is not the author's order. NOT reproduced.
2. Depth overflow warns to a console nobody reads and drops the page. NOT
   reproduced.
3. Suspect mixed widths sort lexically. NOT reproduced.

**Areas checked and clean:** the separator tolerance, the 2–5 digit bound, and
the strip-from-URL path. A named clean area is signal; silence is not.
