---
title: "Marketplace repo — point sids-plugin-marketplace at the new plugin"
status: done
---

`sidhanthapoddar99/sids-plugin-marketplace` vendors this plugin (git-subdir
source from this repo). After the plugin rename ([50](50_plugin-rename-agent-ks.md))
and repo move ([60](60_new-repo.md)), its `marketplace.json` entry must point
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

## Executed 2026-07-08

- `sids-plugin-marketplace` commit `bc2b5f8`: entry renamed `agent-ks`,
  git-subdir source → `agent-knowledge-system.git` / `plugins/agent-ks`,
  description synced from the plugin manifest, old name kept in `keywords`
  for discovery; README table row updated. Old entry REMOVED (not
  tombstoned) — existing installs keep resolving from their installed cache.
- This machine: `claude plugin marketplace update` + install →
  `agent-ks@sids-plugin-marketplace` 0.6.0 at `cache/…/agent-ks/0.6.0/`,
  `enabledPlugins` key swapped, `/reload-plugins` shows the `agent-ks:*`
  skill namespace, CLI runs from the new cache. The hand-mirrored
  `documentation-guide/0.5.x` grace path is retired (dirs GC-eligible).
