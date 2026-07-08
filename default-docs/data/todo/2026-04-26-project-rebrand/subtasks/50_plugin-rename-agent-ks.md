---
title: "Plugin rename — plugins/documentation-guide → plugins/agent-ks"
status: done
---

The plugin itself takes the new identity: folder `plugins/agent-ks`,
`plugin.json` `name: "agent-ks"` (version bumped to 0.6.0), install key
`agent-ks@sids-plugin-marketplace`. Deferred from the skill rename
([10](10_tool-and-skill-rename.md)) because it has external blast radius: the
marketplace repo entry ([80](80_marketplace-repo-update.md)), every consumer's
`enabledPlugins` key, the cache path, and all install instructions
(`/plugin install …`) across README, user-guide, and `/agent-ks-init`.

## Tasks

- [x] Rename the folder + `plugin.json` name/description; sweep install keys
      and cache-path references on live surfaces — README, CLAUDE.md (incl.
      the legacy note, which now records the old plugin identity), user-guide
      getting-started ×3, dev-docs `25_plugins/` ×6 (namespace examples now
      `agent-ks:agent-ks-docs`; bin-wrappers page de-historicized),
      `07_artifact-skill-provenance.md`, `order-prefix.ts` comment, plugin
      README + all 3 command bodies + `cli-toolkit.md` + `_selftest.mjs`.
- [x] Comprehensiveness pass (second sweep): `.gitattributes` bin path,
      `data/README.md` skill paths, and the plugin-sense references in all
      **non-closed** issues (deliberately parked during the
      [30](30_open-issues-consistency.md) sweep because the plugin rename
      hadn't landed yet) — docs-phase-2, artifact-component (incl. integrity
      manifest path strings + agent-memory), editor-diagrams, runtime-stack
      notes/settings. Closed issues keep historical names; verified zero old
      identity strings on live surfaces + active issues afterwards.
- [x] Coordinate with the marketplace update (80): nothing to break *today* —
      the marketplace vendors `plugins/documentation-guide` from the OLD
      repo's `main`, and this rename lives on `rebrand/agent-ks`, which lands
      in the NEW repo. Old installs keep resolving from the frozen old-main
      vendored copy. The marketplace entry flips (new repo URL + path
      `plugins/agent-ks` + name `agent-ks`) in 80, after the repo move (60).
- [ ] *(moves with [80](80_marketplace-repo-update.md))* Real reinstall on this machine: `/plugin install
      agent-ks@sids-plugin-marketplace` can't resolve until the marketplace
      entry exists. Interim state (see decision below) is verified working:
      `agent-ks` on PATH, skills load, `check skill-links` + `check issues` +
      self-test green.
- [x] Transition decision — **grace path, documented:**
      - Existing installs keep the `documentation-guide@sids-plugin-marketplace`
        key, served from the marketplace's vendored copy of old-repo `main`
        (frozen pre-rebrand). Nothing breaks; they just don't get rebrand
        updates.
      - This machine: the renamed plugin content is hand-mirrored into the
        pinned cache (`…/documentation-guide/0.5.5/`) with the cache
        `plugin.json` identity fields pinned to the installed values
        (`documentation-guide` / `0.5.5`) — the ONE deliberate divergence from
        repo source, so Claude Code's registry stays consistent.
      - **autoUpdate hazard:** the marketplace has `autoUpdate: true` and
        re-vendored the plugin on 2026-07-08, clobbering the cache back to
        pre-rebrand content (old skill names, `docs-guide` bin). Any future
        auto-update can do it again until 80 lands — re-mirror if skills
        revert.
      - Hard cut at 80: marketplace entry becomes `agent-ks`, old entry gets a
        tombstone/removal decision there; consumers move with
        `/plugin uninstall documentation-guide@…` + `/plugin install
        agent-ks@…` (documented in 80's verification task).
