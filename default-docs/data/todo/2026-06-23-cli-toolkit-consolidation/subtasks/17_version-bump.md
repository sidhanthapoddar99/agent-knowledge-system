---
title: "Version upgrade — bump the plugin version"
state: review
---

The consolidation is a substantial feature release; bump the `documentation-guide` plugin version so installs pick it up (current: 0.2.1).

## Tasks

- [ ] Bump `version` in `plugins/documentation-guide/.claude-plugin/plugin.json` (and any mirrored manifest)
- [ ] Pick the increment per the size of the change (likely a minor bump given new commands + contract)
- [ ] Confirm the bin path / plugin metadata still resolve after the bump
- [ ] Note the new version in the docs/CLAUDE.md update (subtasks 15/16) if version is referenced there
- [ ] Do this near the end, after the command surface is final
