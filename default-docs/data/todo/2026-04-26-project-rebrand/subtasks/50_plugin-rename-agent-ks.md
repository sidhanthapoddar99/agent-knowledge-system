---
title: "Plugin rename — plugins/documentation-guide → plugins/agent-ks"
status: open
---

The plugin itself takes the new identity: folder `plugins/agent-ks`,
`plugin.json` `name: "agent-ks"`, install key `agent-ks@sids-plugin-marketplace`.
Deferred from the skill rename ([10](10_tool-and-skill-rename.md)) because it
has external blast radius: the marketplace repo entry
([80](80_marketplace-repo-update.md)), every consumer's `enabledPlugins` key,
the cache path, and all install instructions
(`/plugin install …`) across README, user-guide, and `/docs-init`.

## Tasks

- [ ] Rename the folder + `plugin.json` name/description; sweep install keys
      and cache-path references on live surfaces.
- [ ] Coordinate with the marketplace update (80) — plugin name and marketplace
      entry must land together or installs break.
- [ ] Reinstall locally; update `.claude/settings.json` /
      `settings.local.json` enable keys; verify skills load and `agent-ks`
      stays on PATH.
- [ ] Decide transition for existing installs (the old plugin id keeps working
      from cache until updated) — document the hard-cut or grace path.
