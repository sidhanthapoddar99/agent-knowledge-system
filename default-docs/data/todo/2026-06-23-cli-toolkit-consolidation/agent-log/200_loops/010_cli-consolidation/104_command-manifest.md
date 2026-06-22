---
iteration: 4
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Subtask 03 — replace the inline COMMANDS map with a rich manifest as the single source of truth for routing + help + the harness. Approach: created scripts/_manifest.mjs (MANIFEST array; each entry has bin alias, group/verb for the B subcommand form, category, summary, script, runtime, flags[]), plus derived lookups byBin/bySubcommand and resolveCommand(tokens) handling flat alias, '<group> <verb>', and top-level verb forms. Refactored cli.mjs to route via resolveCommand and rebuild argv (drops 1 token for alias, 2 for subcommand); unknown-command lists the full manifest. Made _selftest.mjs manifest-driven so it can't drift. Result: verified — 'docs-list' (alias) and 'issue list' (subcommand) give identical output; 'check section'/'move --help' route correctly; harness steady at 30/54, no regression. The B-naming subcommand dispatch is now FUNCTIONAL through cli.mjs (single 'docs' shim + flat-alias updates come with the rollout). runtime field reserved for subtask 13 (Python). Next: subtask 04 (help/discovery command — consumes the manifest).
