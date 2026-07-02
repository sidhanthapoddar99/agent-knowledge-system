---
title: "Update the docs (user-guide / dev-docs)"
status: done
---

Last documentation step (after skills/CLAUDE.md). Update the framework's bundled human-facing docs to match the consolidated toolkit.

## Tasks

- [ ] User-guide CLI/tooling pages — document `docs help`, the uniform contract (`--help`/`-h`/`--json`/exit codes), and every new command
- [ ] Dev-docs — the dispatcher + manifest architecture, `_cli.mjs` contract, how to add a new command (manifest entry + shim pair), polyglot/Python notes
- [ ] Validator docs — add `docs-check-issues`; clarify `docs-check-section` is for docs sections, NOT the tracker
- [ ] Cross-check every doc table against `docs help --json` so docs and reality agree
- [ ] Run `docs-check-section` on any edited docs section to validate
