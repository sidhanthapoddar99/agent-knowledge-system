---
title: "Build time, before and after"
status: done
agent: claude
---

# Goal
Confirm the extra reader does not cost meaningful build time.

# Inputs
- `working/020_sidebar-and-tree.md`

# Expected Outcome
Before-and-after numbers, with units.

# Outcome
| | Pages | Build |
|---|---:|---:|
| before | 902 | 12.4 s |
| after | 915 | 13.1 s |

+13 pages for +0.7 s. The numbers live here; a driver would live in the code
repo's gitignored benchmark directory, never in the tracker.
