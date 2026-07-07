---
title: "Goal — extensions run: tracker rendering (80) + site-theme mode (90)"
---

## Goal

Implement the two user-accepted scope extensions from live testing: artifacts
rendering first-class inside the issue tracker (`notes/` + `brainstorm/` only),
and the site-theme mode package (sidecar `theme: "site" | "self"`, route-side
theme injection, `docs-guide theme tokens` CLI verb, mode-choice doctrine +
inline variable contract in the skill, CLAUDE.md coupling note, docs).

## Approach

Workflow `wf_814bc80a-d39`: two parallel Opus xhigh builders (one per
subtask), then an e2e verifier, then a fixer. Both briefs carried the
attribute-only theme rule learned from the initial-load desync bug. The main
session separately implemented the full-width artifact view (subtask 80's
follow-up task) and the theme-init fix directly.

## Success criteria

Subtasks 80 + 90 at `review`, all boxes ticked with evidence; both features
browser-verified in both themes; self-mode artifacts byte-identical when
served; CLI verb passing the plugin self-test; skills cache parity; validator
clean.
