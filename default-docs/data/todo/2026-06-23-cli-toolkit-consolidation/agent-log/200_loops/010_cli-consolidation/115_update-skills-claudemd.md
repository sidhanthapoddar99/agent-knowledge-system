---
iteration: 15
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Sync the agent-facing instruction layer to the final 28-command surface, the docs <group> <verb> model, the help/--json discovery convention, and the uniform contract.

Approach: Updated 5 instruction-layer files. (1) CLAUDE.md (repo root): rewrote the CLI tooling section — 13->28 commands, dual-form note, 'Discovery first - docs help' block w/ contract+exit codes+CONTRACT.md pointer, regrouped tables (general/issue/check/doc/blog/git), added docs-check-issues/find/git/doc/blog/resolve-context. (2) documentation-guide SKILL.md: same regrouping + scoping-flags + git-guard notes. (3) references/.../41_searching.md: new 'Search-scoping flags' (--path/--meta/--count) + 'Searching across ALL content - docs find' subsections + examples. (4) user-guide/05_getting-started/05_claude-skills.md: 11->28, regrouped tables, expanded 'when to reach for what'. (5) persistent project memory (cli-toolkit-discovery.md + MEMORY.md): discovery convention + bun-testing gotcha. doc-agent SKILL.md needed no change (only references unchanged docs-add-agent-log).

Result: docs-check-skill-links GREEN (all relative skill links resolve); harness 117/117. Counts cross-checked against docs help (28: 0=3,1=7,2=12,3=6). NOTE pre-existing (out-of-scope) errors: 30_deployment + 35_plugins missing settings.json.

Next: subtask 16 — update user-guide/dev-docs content (incl. the 'docs' bare-name collision caveat); subtask 17 version bump; subtask 18 POST-EDIT matrix.
