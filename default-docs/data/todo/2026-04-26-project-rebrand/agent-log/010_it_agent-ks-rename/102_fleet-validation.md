---
title: "M2 — read-only Haiku fleet validation + fix pass"
iteration: 1
---

## Goal

Sidhantha's ask: validate the rename sweep with a fleet of read-only Haiku
agents (10–20). Ran 15 surface-scoped validators (skills ×3, CLI scripts,
plugin root, CLAUDE.md, root metas, user-guide ×2, dev-docs ×2, source code,
cache parity, the new tracker files, and a sed-collateral hunt), each finding
adversarially verified by a second Haiku against the file on disk — 40 agents
total, 0 errors.

## Result

19 raw findings deduplicated to **6 real defects**, all fixed same-pass:

1. `settings-layout.md` — two broken references predating the rebrand
   (`references/layouts/issues/00_overview.md`, long since moved into the
   issues skill, and a non-existent `env.md`) → repointed.
2. Stale pre-`docs-guide` command form `docs help` / `docs <group> <verb>` in
   CLI script comments and one runtime error string (`cli.mjs`,
   `_help-render.mjs`, `help.mjs`) → now `agent-ks …`.
3. "artifact-authoring skill" used as a descriptor next to the new name in
   CLAUDE.md, the claude-skills user-guide page, and the plugin README table —
   reads as the retired name → rephrased ("the artifact skill" / "Artifacts
   skill").
4. `02_installation.md` still said "A skill" (singular) → 3 skills.

7 of 15 dimensions came back fully clean, including the collateral hunt
(no mangled double-replacements) and the new tracker files. Cache re-mirrored,
parity clean; `agent-ks check skill-links` passes.

## Next

Human review of subtasks 10/20/30/40. Next slice: 50 (plugin rename), which
needs marketplace coordination.
