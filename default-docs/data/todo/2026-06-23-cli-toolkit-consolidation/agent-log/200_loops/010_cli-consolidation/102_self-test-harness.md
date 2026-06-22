---
iteration: 2
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Subtask 14 — stand up the self-test harness early so every later change is guarded. Approach: wrote scripts/_selftest.mjs that invokes the REPO cli.mjs directly (NOT the on-PATH cached bins) and asserts the target Category-0 contract per command: --help exit 0 + non-empty stdout, -h honored, --json parses, .cmd twin exists, plus a help-discovery check that activates once docs-help lands. Result: harness runs; **baseline 22/54 checks pass** — issues commands print --help to stderr and exit 1 (fail exit-0/stdout/-h); validators print usage to stderr; only move/img are fully compliant (4/4). This is the measuring stick; checks turn green as the contract subtasks land. Next: subtask 02 (_cli.mjs shared contract) then 03 (manifest).
