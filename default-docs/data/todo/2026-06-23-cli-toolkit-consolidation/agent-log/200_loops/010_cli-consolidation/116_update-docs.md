---
iteration: 16
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Update the framework's bundled human-facing docs (user-guide + dev-docs) to match the consolidated toolkit, incl. the dispatcher/manifest architecture and the bare-'docs' collision caveat.

Approach: (1) dev-docs/25_plugins/05_creating-plugins/04_bin-wrappers.md — replaced the stale per-script wrapper template with the generic single-shim form (basename -> cli.mjs); added 'Single-dispatcher architecture (manifest-driven)' section (_manifest.mjs / cli.mjs / _cli.mjs + CONTRACT.md) and 'Adding a command' (1 manifest entry + shim pair, harness auto-picks up); added the bare-'docs' collision caveat (CUDA ships a docs binary; prefer flat docs-* aliases for correctness); rewrote multi-runtime section around manifest 'runtime' routing + interpreter detection + exit 127 + resolve-context for non-JS. (2) user-guide/05_getting-started/02_installation.md — 11->28 CLI commands, point to docs help. (claude-skills.md validator catalogue incl. docs-check-issues + docs-check-section clarification was done in subtask 15.)

Result: both edited sections pass docs-check-section; skill-links GREEN; harness 117/117. Cross-checked: docs help reports 28 commands (general 5/issue 8/check 5/doc 3/blog 3/git 4) — matches every doc table.

Next: subtask 17 — version bump (plugin.json 0.2.1 -> next); subtask 18 — POST-EDIT feature matrix + delta (notes/05), then 003_summary.md.
