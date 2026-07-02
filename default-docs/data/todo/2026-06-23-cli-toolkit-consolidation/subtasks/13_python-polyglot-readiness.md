---
title: "Make the dispatcher polyglot-ready (future Python)"
status: done
---

Roadmap-level: keep the door open for Python scripts without forking the contract. The contract must live in the **manifest + a written spec**, not in JS helpers.

## Tasks

- [ ] Allow a manifest entry to point at a `.py` (or other) script; `cli.mjs` routes by registered entry, not hardcoded `.mjs`
- [ ] Interpreter detection mirroring the bun→node fallback: `py -3` → `python3` → `python`, with a graceful "Python not found" error (Python is NOT guaranteed installed on Windows; bun/node is)
- [ ] Expose `_env` resolution as a `resolve-context` sub-command emitting JSON, so non-JS scripts get the content root without re-implementing `.env` discovery
- [ ] Write the contract spec (arg grammar, help shape, `--json`, exit codes) so any language can conform
- [ ] This is a forward-enabler — no Python script ships in this loop unless trivial
