---
title: "Decide naming model: flat docs-* vs `docs <group> <verb>` subcommands"
state: closed
---

**Gating decision** — settle the command surface before adding the per-type list/show/search trio, to avoid the `docs-docs-*` stutter and renaming twice. Blocks subtasks 10 and 11.

## Tasks

- [ ] Decide **A** (keep flat `docs-*`) vs **B** (`docs <group> <verb>` subcommands; cross-content verbs top-level; thin `docs-*` aliases retained)
- [ ] If B: plan `cli.mjs` parsing `argv[2]` group + `argv[3]` verb; keep `docs-*` shims as aliases for muscle memory
- [ ] Confirm the `docs-` prefix's collision-avoidance role is preserved either way (it's the only thing keeping bins from clashing with other plugins)
- [ ] Record decision + rationale in `notes/03_refactor-approach.md` and as a comment on this issue

Lean: **B** once Category 2 fills out (three lists/shows want a namespace), but A is acceptable if the set stays small. See `notes/03` and `notes/04`.
