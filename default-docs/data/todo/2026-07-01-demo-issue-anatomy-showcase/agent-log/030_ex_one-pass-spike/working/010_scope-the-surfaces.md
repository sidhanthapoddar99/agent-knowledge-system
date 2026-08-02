---
title: "Scope the surfaces a one-pass reader must cover"
status: done
agent: claude
---

# Goal

Before prototyping anything, establish what a single-pass reader would actually
have to handle — so the prototype is judged against the real surface rather than
the easy half of it.

# Inputs

- The section shapes the loader supports today: `src/loaders/issues.ts`
- [The decided architecture](../../../notes/01_decided-architecture.md)

# Expected Outcome

A list of the distinct section shapes, and a named judgement on which of them a
single pass can and cannot treat uniformly. Research, so: findings and a
recommendation.

# Outcome

**Eight shapes, and two of them are the problem.**

| Shape | Uniform in one pass? |
|---|---|
| Flat markdown files with a prefix | yes |
| Flat markdown files without a prefix | yes |
| Nested folders, one level | yes |
| Nested folders, up to the cap | yes |
| A folder with its own `settings.json` | yes |
| Diagram files (`.mmd`, `.dot`, `.excalidraw`) | yes |
| **Subtasks — every leaf carries state, and folders are labels with no body** | **no** |
| **Agent logs — reserved child names, and a nested folder may be a child log rather than content** | **no** |

The last two need a discriminator that knows which section it is in. That is the
finding the prototype then had to beat, and did not.

**Recommendation: prototype anyway, but measure legibility as well as speed.**
The interesting question was never whether one pass is possible — it is whether
the discriminator costs more than the four small readers it replaces.
