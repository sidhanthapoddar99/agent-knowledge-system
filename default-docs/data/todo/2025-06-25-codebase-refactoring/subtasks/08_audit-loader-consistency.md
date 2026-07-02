---
title: "Audit loaders for consistency (decomposition pass)"
state: closed
---

**What it meant.** The original umbrella task was "Audit *and refactor* loaders for consistency." This subtask captures the **audit** half — the pass that inspects `astro-doc-code/src/loaders/` and turns "make it consistent" into concrete, trackable work.

**Complete (2026-07-02).** The audit was performed and produced the decomposition this issue now carries:

- **JSDoc** — already consistent → [07_add-jsdoc] (closed).
- **File size** — several files over the ~400-line guideline → [01_split-large-loaders].
- **Error handling** — three coexisting patterns + ~15 silent `catch {}` → [02_standardize-error-handling] (this is the main remaining inconsistency).
- **Type coverage** — ~31 `any` in the cache/path/theme layer → [03_tighten-types].
- **Duplicated primitives** — mtime/JSON-read/signature helpers → [04_shared-utilities].
- **Dead code** — needs a static pass to enumerate → [05_dead-code-sweep].

**Scope note — audit only.** The *refactor* half of the original task is **not** done; it lives in the subtasks above (chiefly [02_standardize-error-handling]). This subtask is closed because the audit deliverable — a complete, evidence-backed work breakdown — exists. Do not read it as "the loaders are now consistent."
