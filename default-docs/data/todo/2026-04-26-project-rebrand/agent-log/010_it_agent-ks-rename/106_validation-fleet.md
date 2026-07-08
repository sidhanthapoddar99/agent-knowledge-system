---
title: "M6 — 5-agent Opus validation fleet + fix pass (pre-marketplace gate)"
iteration: 1
agent: claude-fable-5
date: 2026-07-08
status: success
---

## Goal

Sidhantha's gate before the marketplace update (subtask 80): validate the
whole transition with ~5 Opus agents in the background and confirm nothing
was missed, especially at scale.

## Approach

Five parallel read-only Opus validators, one lens each: (1) old-repo final
state, (2) new-repo brand purity, (3) adversarial review of all touched
scripts (current + the archived migration flow via `git show`), (4) real
consumer journey (actual shallow clone from GitHub + fresh build), (5)
tracker-claim accuracy + cache parity + marketplace-80 readiness.

## Result

Verdicts: old repo PASS · consumer journey PASS (12 MB shallow clone,
833-page build, exit 0) · tracker/cache substantially accurate. Two
validators found real defects, all fixed same-pass:

- **Brand purity — 11 residuals in active issues** (commit `0404509`):
  bare *project-name* uses the earlier sweeps never targeted — tracker
  `settings.jsonc` still advertising `/docs-quick-idea-note`, seven
  npm-package-name lines in runtime-stack brainstorms, two `.excalidraw`
  `"source"` fields, one artifact-component brainstorm line.
- **Script defects — 5 found, the serious ones fixed** (commits `0404509`
  here, `b18f860` on the old repo, which was unarchived → patched →
  re-archived): (D1) the archived migration script interpolated paths into
  `exec bash -c` — an apostrophe in the parent path (e.g. `sid's projects/`)
  broke quoting and could `rm -rf` a different path; now paths travel as
  positional args (sandbox-verified with a real apostrophe path). (D2)
  CONFIG_DIR resolving to exactly the framework root was misclassified as
  consumer → delete/shallow offered on a dogfood checkout; now
  at-or-inside = dogfood. (D3) inline `# comments` on the CONFIG_DIR line
  broke detection; parsing now strips them. (D5) shallow-declined sentinel
  now uses `--absolute-git-dir` (worktree-safe). (D4 — the
  `START_SKIP_UPDATE_CHECK` overload onto the npm confirm — kept as-is:
  it matches the spec'd CI behavior; documented coupling.)
- **Cache/PATH divergence**: stale orphaned `0.5.4` cache dir was still
  first on PATH in long-lived shells with pre-rebrand content (autoUpdate
  clobber residue) — refreshed with current content, identity kept.

Accepted-as-is notes: archived README's body below the banner shows the
old install command (frozen history, banner dominates); `development`
drifts behind `main` between re-alignments.

## Next

Subtask 80 (human): edit `sidhanthapoddar99/sids-plugin-marketplace` →
`.claude-plugin/marketplace.json` — name `agent-ks`, url
`…/agent-knowledge-system.git`, path `plugins/agent-ks`, description from
the repo plugin.json; remove (or tombstone) the old entry — existing
installs keep resolving from the archived repo either way. Then on this
machine: `/plugin uninstall documentation-guide@…` + `/plugin install
agent-ks@…` (swaps the `enabledPlugins` key, retires the hand-mirror
grace path and closes subtask 50's last box). Until then an autoUpdate
can still clobber the cache — re-mirror if skills revert.
