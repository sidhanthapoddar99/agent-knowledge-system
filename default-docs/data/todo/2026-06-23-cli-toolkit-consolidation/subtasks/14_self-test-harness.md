---
title: "Build a self-test / smoke harness for the toolkit"
state: open
---

The test backbone the loop verifies against. A single runnable harness that exercises every command's contract — so each iteration can prove it didn't regress.

## Tasks

- [ ] `scripts/_selftest.mjs` (or similar) that, for every manifest command: runs `--help` (asserts exit 0 + non-empty stdout), runs `--json` where applicable (asserts valid JSON via `JSON.parse`), and asserts the exit-code scheme
- [ ] Discovery test: `docs help --json` parses and contains every manifest entry
- [ ] Validator fixtures: a known-good and known-bad sample per validator → assert exit 0 vs 1
- [ ] Regression assertions: `docs-list`/`docs-show`/`docs-subtasks` against this very issue; `docs-show <id> --full` runs without error
- [ ] Cross-platform smoke: assert every command has a `.cmd` twin
- [ ] Make it runnable in one command; the loop runs it every iteration and at completion
