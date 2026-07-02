---
iteration: 5
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

# Milestone 5 — Single `docs-guide` entrypoint (post-loop)

> Follow-on refinement after the original loop closed, driven by review feedback: collapse the dual command surface to one collision-safe entrypoint.

## Goal
The loop shipped two ways to call everything (`docs <group> <verb>` *and* 28 flat `docs-*` aliases). Reduce that to a single, collision-safe entrypoint.

## Approach
- **Rename:** bare `docs` dispatcher → **`docs-guide`**. A bare `docs` is not prefix-namespaced and lost to CUDA's `docs` on PATH (in WSL the Windows paths sort ahead of the plugin bin); `docs-guide` is safe by the same rule as `docs-list` was.
- **Remove flat shims:** all 28 `docs-*` + `.cmd` shims deleted — only `docs-guide` + `docs-guide.cmd` remain. Flat names survive only as internal manifest ids (`docs-guide help docs-list` still resolves).
- **Dispatcher fixes:** bare `docs-guide` / `--help` / `-h` now show the listing (was "unknown command"); added `--status all`; `printHelp` renders the `docs-guide` form.
- **Doc sweep:** every skill reference, the user-guide, `CONTRACT.md`, dev-docs, and script usage strings converted to `docs-guide <group> <verb>`; the toolkit catalog removed from CLAUDE.md (it lives in the skill now); added the comprehensive `references/cli-toolkit.md`.

```text
before:  docs <group> <verb>   +   28 flat docs-* shims   (two surfaces)
after:   docs-guide <group> <verb>   (one shim; flat names = internal ids only)
```

## Result
- `bin/` holds exactly `docs-guide` + `docs-guide.cmd`.
- Harness **91/91** — the drop from 117 is the retired per-command `.cmd`-twin checks, replaced by one dispatcher check. `skill-links` clean; `docs help --json` still matches the manifest.

## Next
Fix the agent-logs themselves (they were coming out as run-on paragraphs) — see milestone 6.
