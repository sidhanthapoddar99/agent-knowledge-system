---
title: "Fix latent bugs surfaced by the audit"
state: open
---

Cheap correctness wins found while mapping the toolkit.

## Tasks

- [ ] `issues/show.mjs --full` references `path.join` / `fs.readFileSync` / `fs.existsSync` but imports **neither** `node:path` nor `node:fs` → `ReferenceError`. Add the imports; confirm `docs-show <id> --full` runs
- [ ] `issues/review-queue.mjs` never sets an exit code (always 0) — align to the uniform scheme (subtask 05)
- [ ] Sweep for other "uses module without importing it" cases across scripts while touching them
- [ ] Add a regression check for `--full` to the self-test harness (subtask 14)
