---
title: "M2 — worktree-escape fix applied (A: boundary-stop + B: skill mandate)"
iteration: 1
agent: claude-fable-5
date: 2026-07-08
status: success
---

## Goal

Apply the fix for the benchmark's one real finding (see
[101](101_run-and-metrics.md) and the brainstorm explainer
`brainstorm/01_wt-escape-bug.html`): `agent-ks` run inside a git worktree
escaped to the outer repo via the `.env` upward walk.

## Approach

Both options from the explainer, per the audit's verdict:

- **A (mechanical):** `_env.mjs findEnvFile()` now stops the upward walk at
  a checkout boundary — a directory whose `.git` is a FILE (worktrees,
  submodules). The boundary dir is still checked for its own `.env` first,
  so a submodule-vendored framework keeps working; only walking PAST the
  boundary is forbidden. The no-env error message now names the worktree
  case and the escape hatches (worktree-local `.env`, `--tracker`,
  `DOCS_PROJECT_ROOT`).
- **B (defense in depth):** one mandate line in both `agent-ks-docs` and
  `agent-ks-issues` SKILL.md CLI sections — inside a worktree, write a local
  `.env` or pass explicit paths before any write.

## Result

Verified in a sandbox (gitignored `.env`, real `git worktree add`):

- Worktree without `.env` → walk returns null (previously: found the outer
  repo's `.env` — the bug). CLI falls through to its explicit error.
- Normal checkout (`.git` directory) → own `.env` still found.
- Submodule shape (`.git` file + own `.env`) → own `.env` still honored.
- Worktree-local `.env` → honored.

Plugin version 0.6.0 → 0.6.1; cache mirrored (parity identical), self-test
PASS, `check skill-links` clean.

## Next

Nothing — finding closed same-day. Future benchmark/worktree agents get
either a hard stop with instructions or their own sandbox-local resolution.
