---
title: "Marketplace repo — point sids-plugin-marketplace at the new plugin"
status: open
---

`sidhanthapoddar99/sids-plugin-marketplace` vendors this plugin (git-subdir
source from this repo). After the plugin rename ([60](60_plugin-rename-agent-ks.md))
and repo move ([50](50_new-repo.md)), its `marketplace.json` entry must point
at the new repo + new plugin path/name, so `/plugin install
agent-ks@sids-plugin-marketplace` resolves.

## Tasks

- [ ] Update the marketplace entry (source repo, subdir path, plugin name,
      description) in the marketplace repo.
- [ ] Keep or retire the old `documentation-guide` entry — decide: tombstone
      entry pointing at `agent-ks`, or removal (installs from cache keep
      working either way).
- [ ] Verify a clean-machine install: `marketplace add` → `plugin install
      agent-ks@…` → skills trigger, `agent-ks` on PATH.
