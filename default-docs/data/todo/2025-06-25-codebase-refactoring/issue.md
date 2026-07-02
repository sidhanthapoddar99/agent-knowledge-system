## Goal

Codebase is clean, consistent, and the documentation matches the refactored code.

## Tasks

Decomposed into first-class subtasks after a 2026-07-02 code audit of `src/loaders/` (the checklist was all-unchecked but the code state is mixed — some goals are already met, others genuinely open).

**Done (closed):**

- `subtasks/07_add-jsdoc` — ✅ JSDoc coverage already total (every loader's `/**` count ≥ its export count)
- `subtasks/08_audit-loader-consistency` — ✅ the audit pass itself, which produced this decomposition (the *refactor* half remains, chiefly in 02)

**Remaining work (open):**

- `subtasks/01_split-large-loaders` — several files over the ~400-line guideline (`issues.ts` 777, `cache-manager.ts` 524, `theme.ts` 513, `data.ts` 438)
- `subtasks/02_standardize-error-handling` — three coexisting patterns + ~15 silent `catch {}`
- `subtasks/03_tighten-types` — ~31 `any` in `theme.ts` / `paths.ts` / `cache-manager.ts` / `cache.ts`
- `subtasks/04_shared-utilities` — consolidate duplicated mtime/JSON-read/signature primitives
- `subtasks/05_dead-code-sweep` — needs a `tsc --noUnusedLocals` / knip pass to enumerate (not yet audited)
- `subtasks/06_docs-and-example-sync` — deferred, gated on `2026-04-19-docs-phase-2`
