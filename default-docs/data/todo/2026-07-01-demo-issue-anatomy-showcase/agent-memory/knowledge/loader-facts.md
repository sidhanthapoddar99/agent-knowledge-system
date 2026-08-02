---
title: "Loader facts"
---

# Loader facts — what is true and binding here

**Corrected in place.** A wrong entry is fixed or removed, never amended with a
note saying it was wrong.

| Fact | Consequence |
|---|---|
| Depth is capped at 5 below a section, and overflow is **silent** | A rule the renderer drops is worse than no rule — state the budget, don't discover it |
| Prefixes sort by **numeric value**, so widths coexist | `01_` and `010_` are 1 and 10; `70_` sits between `060_` and `200_` |
| `.html` artifacts render only in `notes/` and `brainstorm/` | A run that produces a dashboard graduates it, rather than leaving it unrendered in a log |
| `working` and `debrief` are reserved inside an agent log | Anything else matching `NNN_<code>_<name>/` is a child log — no ambiguity at read time |
