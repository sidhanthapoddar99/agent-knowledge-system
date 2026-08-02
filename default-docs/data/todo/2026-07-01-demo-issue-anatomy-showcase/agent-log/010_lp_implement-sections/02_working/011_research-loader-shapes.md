---
title: "Research — loader shapes"
status: done
agent: claude
---

# Goal
Survey how the existing loaders read a nested folder, so the new reader
copies a shape that already works rather than inventing a fourth one.

# Inputs
- `src/loaders/` — every existing reader

# Expected Outcome
Findings and a recommendation.

# Outcome
Three shapes in use; two are the same shape with different names. Recommend
the free-form tree reader — it already handles the depth cap and the
prefix-stripping, and nothing about a section makes it special.

**A producer file, and this is the case people get wrong.** It sits at `011`
because it belongs to iteration `01`; it is not iteration `11`.
