---
title: "Migrations at root, skills + docs + CLAUDE.md aligned"
iteration: 2
agent: claude-fable-5
status: success
date: 2026-07-03
---

# Migrations at root, skills + docs + CLAUDE.md aligned

## Goal

Subtasks 30–50 — move the code, keep the protocol in the skill, document the
contract everywhere.

## Result

- `git mv` of all three plugin migration scripts to repo-root `migration/`,
  version-named (`0.5.0_done-to-state.py`, `0.6.0_state-to-status.py`,
  `0.7.0_root-settings-schema.py`), authoring dates moved into docstrings;
  `migration/README.md` carries the convention; plugin `migration/` folder
  removed (repo + installed cache).
- Skill updates: `doc-migration.md` rewritten (root location, version naming,
  the gate as primary trigger, the upgrade flow), stale script citations fixed
  in `03_overall-issue-tracker-vocabulary.md`, `CONTRACT.md`, and the
  `issues/check.mjs` error strings; `settings-layout.md` documents
  `engine_version`. Cache mirrored, parity diff clean.
- User-guide: new `10_configuration/07_versioning.md` quoting both real gate
  errors verbatim; `engine_version` added to the site.yaml reference interface
  + example.
- CLAUDE.md (last, by design): `migration/` in the repo layout, a "Version
  contract" concept paragraph, Key Rule 9.
- Final verification: build green — **702 pages** — tracker validation clean.

## Next

— (all five subtasks at `review`; human sign-off closes the issue)
