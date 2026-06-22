---
iteration: 3
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Subtask 02 — lift the shared CLI contract into a top-level _cli.mjs so all domains (not just issues/) share one parser/help/output/exit surface. Approach: created scripts/_cli.mjs as the canonical home for parseArgs + printHelp (moved verbatim, behavior-preserving) plus new contract helpers emitJson/die/usageError/assertKnownFlags and a re-export of reportAndExit; rewired issues/_lib.mjs to import+re-export parseArgs/printHelp from _cli (issues/* import sites unchanged). Result: no regression — under bun, docs-list/show/subtasks run fine, move/img still 4/4. ALSO fixed a harness bug: it was running under node (which can't resolve gray-matter — the plugin ships no node_modules), giving a FALSE 22/54 baseline; the harness now detects bun→node like the shims. **True baseline is 30/54** under bun. Next: subtask 03 (manifest), which _cli's help renderer + the harness discovery check will consume. Note: contract NORMALIZATION (help→stdout, -h, --json everywhere, exit codes) is subtask 05; 02 is the lift only.
