---
title: Bump the plugin version number
state: closed
---

Once the work in this issue lands (the skill split `030`, agent-log standardization `040`,
the new `doc-agent` skill `045`, and any `050` validator changes), the `documentation-guide`
plugin's version must be bumped so consumers pick up the changes.

*Mechanical release step — do this last, after the substantive subtasks close.*

## What to bump

- `plugins/documentation-guide/.claude-plugin/plugin.json` → `"version"`.
  - Currently `0.1.8` (already bumped from `0.1.7` when `045`/`doc-agent` landed). Decide the
    final number once the remaining subtasks are done — this issue ships **two new skills'
    worth of structure + a reference split**, so a single coherent bump (e.g. `0.2.0`) may be
    cleaner than the incremental `0.1.x` steps taken mid-flight.
- Check for any **other** place the version is declared and keep them in sync:
  - a marketplace manifest (`marketplace.json`), if one references this plugin with a pinned
    version;
  - the plugin `README` / install docs, if they cite a version;
  - the framework `CLAUDE.md` skills section, if it names a version.

## Notes

- Semver intent: this issue is **additive** (new `doc-agent` skill, restructured references,
  new agent-log convention) with no breaking change to existing commands/CLIs → minor bump,
  not major.
- Do this as the **final step** of the issue so the version reflects the complete set of
  changes, not a partial state.

**Done 2026-06-22:** bumped `plugin.json` `0.1.8 → 0.2.0` (the single coherent minor bump for the whole additive issue). No other in-repo version declarations to sync — no `marketplace.json` here (it lives in the external `sids-plugin-marketplace`), and neither the README nor `CLAUDE.md` cites a version.
