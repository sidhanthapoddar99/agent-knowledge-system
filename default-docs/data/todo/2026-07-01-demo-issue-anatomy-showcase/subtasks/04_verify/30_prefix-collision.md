---
title: "Prefix collision"
status: done
---

# Overview

`00-foo` and `00_foo` both parse to `0`, so two siblings sort by filename rather
than by the author's order.

# References

- [The executing half](../../agent-log/020_au_edge-cases/working/012_executing-half.md) — reproduced

# Todo list

- [x] Tie-break on the raw name after the numeric value
- [x] Fixture case beside a prefixed sibling

# Outcomes and Next Steps

Fixed. `_` remains canonical, `-` remains tolerated, and the tie-break is stable.
