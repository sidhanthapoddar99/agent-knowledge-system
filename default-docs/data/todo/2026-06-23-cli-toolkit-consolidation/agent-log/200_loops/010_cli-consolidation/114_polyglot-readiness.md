---
iteration: 14
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Make the dispatcher polyglot-ready (subtask 13, forward-enabler) — keep the door open for Python without forking the contract; contract must live in manifest + written spec, not JS helpers.

Approach: (1) _runtime.mjs — INTERPRETERS map + findInterpreter (py: 'py -3'->'python3'->'python', --version probe) + isKnownRuntime, mirroring bun->node fallback. (2) cli.mjs now routes by entry.runtime: 'mjs' imported in-process, any other registered runtime spawned via detected interpreter (stdio inherit, exit code propagated), graceful exit 127 + actionable message when interpreter absent. (3) resolve-context.mjs (+ manifest entry, shim) emits .env-derived contentRoot/configDir/dataDir as KEY=value (shell-sourceable) or --json, so non-JS scripts skip re-implementing .env discovery. (4) CONTRACT.md — full written spec: routing, arg grammar, central --help, stdout/stderr+--json+sync-write rule, exit-code table, resolve-context handoff, add-a-command, polyglot status.

Result: harness 117/117 GREEN (29 commands). PROVED end-to-end with throwaway _polytest.py + temp manifest entry: .py routed through python3, honored --json + exit 0, worked in flat-alias AND subcommand forms, --help rendered language-agnostically from manifest; reverted clean. Detection verified: py->python3, mjs->null (in-process), unknown runtime rejected. No Python ships (forward-enabler only).

Next: subtask 15 — update skills + preferences + CLAUDE.md (subtask 14 harness already done early).
