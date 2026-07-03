---
title: "Move migration code to the repo root + update the skills"
status: review
---

The repo root owns the code; the skill owns the protocol
(`notes/01_versioning-and-migration-design.md` § ownership split).

- [ ] `git mv` the three scripts from
      `plugins/documentation-guide/skills/documentation-guide/migration/` to
      `<repo-root>/migration/`, renamed version-based: `0.5.0_done-to-state.py`,
      `0.6.0_state-to-status.py`, `0.7.0_root-settings-schema.py`; original
      dates into each docstring; add `migration/README.md` (convention, one
      screen).
- [ ] Rewrite the skill's `references/doc-migration.md`: root location,
      version-based naming, the gate, the upgrade flow (error → run chain →
      bump `engine_version`). Keep the detect → confirm → migrate protocol.
- [ ] Sweep both skill trees for old migration paths/names
      (`03_overall-issue-tracker-vocabulary.md` cites
      `migration/2026-07-03_root-settings-schema.py` twice) and the
      `settings-layout.md` site.yaml key list (add `engine_version`).
- [ ] Mirror everything to the installed cache (including deleting its
      `migration/` folder); parity diff clean.
