---
title: "Dedup repeated logic into shared libs"
state: closed
---

The audit found the same logic implemented multiple times. Consolidate now that `_cli.mjs` + shared libs give it a home (do after subtask 02).

## Tasks

- [ ] Link-rewriting (`LINK_RE`, ignorable-target detection, relative-link recompute, markdown walkers) is duplicated in `docs/move.mjs`, `images/optimize.mjs`, and `check-skill-links.mjs` → extract to a shared `_links.mjs`
- [ ] 2-level depth-capped tree-walkers exist in `issues/_lib` (`walkTwoLevels`) and `issues/check.mjs` (`walkSubtasks`) → unify
- [ ] External-tool detection: `binaryAvailable` (`issues/_lib`) vs `findEngine` try/catch (`images/_lib`) → one shared `detectBinary` helper
- [ ] Duplicated constants (`FOLDER_PATTERN`, `VALID_STATES`, AI-agent set, frontmatter parsing) shared between `issues/_lib` and `issues/check` → single source
- [ ] No behavior change — guard with the self-test harness
