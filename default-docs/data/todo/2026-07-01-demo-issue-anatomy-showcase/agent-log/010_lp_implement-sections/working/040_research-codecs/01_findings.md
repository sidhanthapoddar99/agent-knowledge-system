---
title: "Findings"
status: done
agent: claude
---

# Goal
Survey the prefix grammars in use across the framework before the reader freezes one.

# Inputs
- `src/parsers/core/order-prefix.ts`

# Expected Outcome
Findings and a recommendation.

# Outcome
Five grammars, two of them the same. Recommend the shared loose parser.

**Why this is a FOLDER and not a file.** One producer made several artifacts —
this write-up and the diagram beside it. That is the only reason to nest inside
`working/`; two producers would be two files, not two folders.
