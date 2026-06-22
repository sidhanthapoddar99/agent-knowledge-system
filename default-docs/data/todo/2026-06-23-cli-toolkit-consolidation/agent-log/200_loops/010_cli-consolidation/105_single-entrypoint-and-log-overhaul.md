---
iteration: 5
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

# Milestone 5 — Single `docs-guide` entrypoint + agent-log overhaul (post-loop)

> Follow-on refinement after the original loop closed, driven by review feedback.

## Goal
Collapse the dual command surface to one collision-safe entrypoint, and fix loop agent-logs that were coming out as unreadable run-on paragraphs.

## Approach
- **Single entrypoint:** renamed the bare `docs` dispatcher → **`docs-guide`** (prefix-namespaced; a bare `docs` lost to CUDA's `docs` on PATH). Removed all 28 flat `docs-*` shims — only `docs-guide` + `.cmd` remain; flat names live on as internal manifest ids.
- **Dispatcher fixes:** bare `docs-guide` / `--help` / `-h` now show the listing; `--status all`; `printHelp` renders the `docs-guide` form.
- **Doc sweep:** every reference, the user-guide, CONTRACT.md, dev-docs, and script usage strings converted to `docs-guide <group> <verb>`; toolkit catalog removed from CLAUDE.md (lives in the skill); new comprehensive `references/cli-toolkit.md`.
- **Agent-log overhaul:** made **direct file-write the default** (sectioned markdown + diagrams), demoted `docs-guide issue add-agent-log` to one-liner-only (it flattens multi-line `--body`), and added the **"log milestones, not steps"** rule — then proved it by consolidating *this loop's* 18 per-subtask logs into these 5 milestone entries.

```text
before:  101_naming … 118_post-edit-matrix     (18 logs, 1 per subtask, flat prose)
after:   101 foundation · 102 correctness · 103 feature-buildout
         104 docs/version/close-out · 105 this entry   (5 milestone logs, sectioned)
```

## Result
- `bin/` holds exactly `docs-guide` + `docs-guide.cmd`; harness **91/91** (the drop from 117 is the retired per-command `.cmd`-twin checks, replaced by one dispatcher check).
- `skill-links` clean; `docs help --json` still matches the manifest.
- Root cause of unreadable logs addressed at the source: skill + reference now steer to direct, structured writes.

## Next
Awaiting human review/merge of branch `cli-consolidation` (never pushed). After merge: set the issue + subtasks to `closed`.
