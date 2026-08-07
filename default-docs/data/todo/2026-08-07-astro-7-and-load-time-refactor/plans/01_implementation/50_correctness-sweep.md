---
title: "Correctness sweep"
outcome: "The remaining audit findings are closed, including the two that are live user-visible defects"
notes: "Two of these close on a **written decision**, not a code change — the unreachable `default` theme name, and whether dependency tracking is built or deleted"
who: claude
status: open
subtasks:
  - "[Theme loader bugs](../../subtasks/030_correctness/030_theme-loader-bugs.md)"
  - "[Undeclared CSS variables](../../subtasks/030_correctness/040_undeclared-css-variables.md)"
  - "[cache-manager dependency tracking](../../subtasks/030_correctness/020_cache-manager-dependency-tracking.md)"
  - "[Small correctness fixes](../../subtasks/050_cleanup/020_small-correctness-fixes.md)"
---

The remaining audit findings. Four subtasks, none large, all applied to the post-upgrade
state rather than to a state [stage 40](./40_the-upgrade.md) was about to change.

Two of these are live user-visible defects, not hygiene: dark mode is already broken on
task-checkbox borders, and a circular theme `extends` hangs the build rather than erroring.

## Todo

- [ ] [theme loader bugs](../../subtasks/030_correctness/030_theme-loader-bugs.md) — the `extends` cycle hang and the unreachable `default` name
- [ ] [undeclared CSS variables](../../subtasks/030_correctness/040_undeclared-css-variables.md) — 44 of them, including one live dark-mode defect
- [ ] [cache-manager dependency tracking](../../subtasks/030_correctness/020_cache-manager-dependency-tracking.md) — implement it or delete it, and correct `CLAUDE.md` either way
- [ ] [small correctness fixes](../../subtasks/050_cleanup/020_small-correctness-fixes.md) — the unguarded production POST, and 139 unhighlighted fences

## Gate

Each subtask's "done when" passes. Two of them additionally require a *written decision* rather than a code change: what happens to a user theme named `default`, and whether dependency tracking is built or removed. A stage that closes with either left implicit has not finished.

## Questions

- [ ] **Read the content-embed cache issue before deleting the cache-manager API.** If that issue is going ahead, those ~120 lines are its foundation and should be built rather than removed. This is the one item here that can go either way.
- [ ] The undeclared-variables work may change `theme.yaml → required_variables`. If it does, `CLAUDE.md` requires the `agent-ks-artifacts` skill's inline copy to be mirrored byte-identically, in **both** the repo source and the installed plugin cache. That mirror is part of the work, not a follow-up.
- [ ] Adding six Shiki languages adds grammar chunks — the build already carries `emacs-lisp` at 764 KB and `cpp` at 612 KB. Check whether chunks load lazily per page before adding; if they load eagerly, alias `text` and `env` instead of adding grammars.
