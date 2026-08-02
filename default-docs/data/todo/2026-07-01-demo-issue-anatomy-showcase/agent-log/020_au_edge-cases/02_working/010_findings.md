---
title: "Merged verdict"
status: done
agent: claude
---

# Goal
Merge both halves of the pair into one verdict per finding.

# Inputs
- `working/011_reading-half.md`
- `working/012_executing-half.md`

**Both**, and that is the point of the field: a verdict written from one half is
a review that read half a pair, and nothing afterwards can tell.

# Expected Outcome
A verdict per finding: fix / reject / defer / not-ready.

# Outcome
| Finding | Half that found it | Verdict |
|---|---|---|
| A `00-` separator sorts as `0`, colliding with `00_` | reading | **fix** |
| Depth-cap overflow is silent | reading | **fix** |
| Mixed widths sort wrongly | reading | **reject** — the executing half could not reproduce it; the parser sorts by numeric value |

**Union, not vote.** The reading half found three, the executing half
reproduced one and refuted one. The refuted one is dropped on evidence, not on
a count — and the one neither could refute stands.
