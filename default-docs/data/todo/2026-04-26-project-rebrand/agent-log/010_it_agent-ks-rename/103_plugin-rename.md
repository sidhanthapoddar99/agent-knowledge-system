---
title: "M3 — plugin rename: plugins/agent-ks + live-surface sweep + cache repair"
iteration: 1
agent: claude-fable-5
date: 2026-07-08
status: success
---

## Goal

Execute subtask 50: the plugin itself takes the `agent-ks` identity — folder,
manifest, install-key and cache-path references on live surfaces — while
keeping today's installs working (marketplace entry doesn't flip until 80).

## Approach

`git mv plugins/documentation-guide plugins/agent-ks`; `plugin.json` name →
`agent-ks`, version → 0.6.0; grep-driven sweep of every live surface carrying
the plugin identity (18 files), with contextual handling — namespace examples
(`agent-ks:agent-ks-docs`), install keys, cache paths, prose plugin-name
mentions; the CLAUDE.md legacy note extended to record the old plugin name +
install key. Tracker files untouched except this issue's own records.

## Result

- Zero `documentation-guide` occurrences left on live surfaces outside the
  legacy note and the tracker.
- **Discovery:** marketplace `autoUpdate` had re-vendored the plugin at 00:44
  today — the installed cache (0.5.5) had reverted to pre-rebrand content
  (old skill names, `docs-guide` bin). Repaired: renamed plugin mirrored into
  the pinned `…/documentation-guide/0.5.5/` cache, with cache `plugin.json`
  identity pinned to installed values (`documentation-guide`/0.5.5) as the one
  deliberate divergence. Hazard + recipe recorded in subtask 50 and agent
  memory; permanent fix is 60+80.
- Verified from the repaired cache: `agent-ks help` OK, `check skill-links`
  clean, `check issues` unchanged (pre-existing warnings only), self-test
  PASS; production build green.
- Transition decision documented on the subtask: grace path (old installs
  frozen on old-main vendored copy) → hard cut at 80.

## Next

Subtask 50 → review. 60 (new repo, human-owned creation) unblocks 70/80/90;
the local real-reinstall task on 50 stays open until 80 resolves
`agent-ks@sids-plugin-marketplace`.
